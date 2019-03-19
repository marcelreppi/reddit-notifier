const RSSParser = require('rss-parser')
const mailerPromise = require('nodemailer-promise')
const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'eu-central-1'
})

module.exports.fetchRSSFeed = async function(subreddit) {
  const rssParser = new RSSParser

  const params = {
    TableName: 'reddalert-serverless-latest-posts',
    Key: {
      subreddit
    }
  }
  const result = await docClient.get(params).promise()

  let query = '?limit=100'
  if (result.Item) {
    query += `&before=${result.Item.latestPostId}`
  }
  const feed = await rssParser.parseURL(`https://www.reddit.com/r/${subreddit}/new.rss${query}`) 

  if (feed.items.length > 0) {
    const params = {
      TableName: 'reddalert-serverless-latest-posts',
      Item: {
        subreddit,
        latestPostId: feed.items[0].id
      }
    }
    await docClient.put(params).promise()
  }

  return feed
}

const sendMail = mailerPromise.config({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_SENDER,
    pass: process.env.MAIL_PW
  }
})

module.exports.sendNotification = async function(subreddit, links) {
  const mailOptions = {
    from: process.env.MAIL_SENDER,
    to: process.env.MAIL_RECEIVER,
    subject: 'New interesting post(s) in subreddit ' + subreddit,
    text: `${links.join('\n\n')}`
  };
  
  const info = await sendMail(mailOptions)
  console.log(info)

  return info
}