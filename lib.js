const RSSParser = require('rss-parser')
const mailerPromise = require('nodemailer-promise')

const latestPostIds = {}

module.exports.fetchRSSFeeds = async function(subreddits) {
  const rssParser = new RSSParser
  const feedPromises = subreddits.map( sr => {
    let query = '?limit=100'
    if (latestPostIds[sr]) {
      query += `&before=${latestPostIds[sr]}`
    }
    return rssParser.parseURL(`https://www.reddit.com/r/${sr}/new.rss${query}`) 
  })

  const feeds = await Promise.all(feedPromises)
  feeds.forEach( (f, i) => {
    if (f.items.length > 0) latestPostIds[subreddits[i]] = f.items[0].id
  })
  return feeds
}

const sendMail = mailerPromise.config({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PW
  }
})

module.exports.sendNotification = async function(post, subreddit) {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: process.env.MAIL_RECEIVER,
    subject: 'New interesting post in subreddit ' + subreddit.name,
    text: `${post.link}`
  };
  
  // console.log('notify')
  const info = await sendMail(mailOptions)
  console.log(info)

  return info
}