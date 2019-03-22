const axios = require('axios')
const mailerPromise = require('nodemailer-promise')
const AWS = require('aws-sdk')

const bot = require("./bot.js")

const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'eu-central-1'
})

exports.fetchJSONFeed = async function(subreddit) {
  const TableName = 'reddit-notifier-latest-posts'
  const params = {
    TableName,
    Key: {
      subreddit
    }
  }
  const result = await docClient.get(params).promise()

  let query = '?limit=100'
  if (result.Item) {
    query += `&before=${result.Item.latestPostId}`
  }
  const response = await axios.get(`https://www.reddit.com/r/${subreddit}/new.json${query}`) 
  const feed = response.data.data.children

  if (feed.length > 0) {
    const params = {
      TableName,
      Item: {
        subreddit,
        latestPostId: feed[0].data.name
      }
    }
    await docClient.put(params).promise()
  }

  return feed
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_SENDER,
    pass: process.env.MAIL_PW
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Mail server is ready");
  }
});

exports.sendNotification = async function(subreddit, posts) {
  const subject = 'New interesting post(s) in subreddit ' + subreddit
  const content = `${posts.map( p => `${p.data.title}\n${p.data.url}` ).join('\n\n')}`
  const mailOptions = {
    from: process.env.MAIL_SENDER,
    to: process.env.MAIL_RECEIVER,
    subject,
    text: content
  };

  await bot.telegram.sendMessage(process.env.MY_CHAT_ID, `${subject}:\n\n${content}`)
  
  return await transporter.sendMail(mailOptions)
}