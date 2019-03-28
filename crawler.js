const AWS = require("aws-sdk")
const axios = require("axios")

const { sendNotification } = require("./notify.js")
const { sendBotMsg } = require("./bot.js")

const docClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-central-1",
})

async function fetchJSONFeed(subreddit) {
  // Fetch latest posts
  await sendBotMsg(`Fetching /r/${subreddit}`)
  const response = await axios.get(
    `https://www.reddit.com/r/${subreddit}/new.json?limit=100`
  )

  const feed = response.data.data.children

  const TableName = "reddit-notifier-latest-posts"
  const params = {
    TableName,
    Key: {
      subreddit,
    },
  }
  const { Item: latestPost } = await docClient.get(params).promise()

  // Find latest post from that subreddit and remove already seen posts
  const i = feed.findIndex(x => x.data.created <= latestPost.latestPostCreated)
  if (i !== -1) {
    feed.splice(i)
  }

  // Update latest seen post
  if (feed.length > 0) {
    const params = {
      TableName,
      Item: {
        subreddit,
        latestPostCreated: feed[0].data.created,
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
    await sendBotMsg(`Found ${feed.length} new posts in /r/${sr.name}:`)

    const keywordsRegexString = sr.keywords
      .map(k => {
        if (k.includes("AND")) {
          const words = k.split(" AND ")
          return `(${words.map(w => `(?=.*${w})`).join("")})`
        }
        return `(${k})`
      })
      .join("|")
    const keywordsRegex = new RegExp(keywordsRegexString, "gi")
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
    await sendBotMsg(`No matching posts in any of the subreddits`)
  }
}

module.exports = { checkReddit }
