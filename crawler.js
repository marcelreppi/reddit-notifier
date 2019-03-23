const AWS = require("aws-sdk")
const axios = require("axios")

const { sendNotification } = require("./notify.js")
const bot = require("./bot.js")

const docClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-central-1",
})

async function fetchJSONFeed(subreddit) {
  const TableName = "reddit-notifier-latest-posts"
  const params = {
    TableName,
    Key: {
      subreddit,
    },
  }
  const result = await docClient.get(params).promise()

  let query = "?limit=100"
  if (result.Item) {
    query += `&before=${result.Item.latestPostId}`
  }
  const response = await axios.get(
    `https://www.reddit.com/r/${subreddit}/new.json${query}`
  )
  const feed = response.data.data.children

  if (feed.length > 0) {
    const params = {
      TableName,
      Item: {
        subreddit,
        latestPostId: feed[0].data.name,
      },
    }
    await docClient.put(params).promise()
  }

  return feed
}

const { subreddits } = require("./subreddits.json")

async function checkReddit() {
  let newPosts = false
  for (const sr of subreddits) {
    const feed = await fetchJSONFeed(sr.name)
    const keywordsRegex = new RegExp(sr.keywords.join("|"), "gi")
    const matchingPosts = []
    for (const post of feed) {
      if (post.data.title.match(keywordsRegex)) {
        matchingPosts.push(post)
      }
    }

    if (matchingPosts.length > 0) {
      newPosts = true
      const result = await sendNotification(sr.name, matchingPosts)
      console.log(result)
    }
  }

  if (!newPosts) {
    await bot.telegram.sendMessage(
      process.env.MY_CHAT_ID,
      `No new messages in any of the subreddits`
    )
  }
}

module.exports = { checkReddit }
