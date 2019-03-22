const { fetchJSONFeed, sendNotification } = require('./lib.js')
const bot = require("./bot.js")

const subreddits = require('./subreddits.json').subreddits

async function checkReddit() {
  let newPosts = false
  for (const sr of subreddits) {
    const feed = await fetchJSONFeed(sr.name)
    const keywordsRegex = new RegExp(sr.keywords.join('|'), 'gi')
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
    await bot.telegram.sendMessage(process.env.MY_CHAT_ID, `No new messages in any of the subreddits`)
  }
}

module.exports = { checkReddit }