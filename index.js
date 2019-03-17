const dotenv = require('dotenv')
dotenv.config()

const { fetchRSSFeeds, sendNotification } = require('./lib.js')

const subreddits = require('./subreddits.json').subreddits

async function checkReddit() {
  const feeds = await fetchRSSFeeds(subreddits.map( sr => sr.name ))
  
  for (const [i, feed] of feeds.entries()) {
    const keywordsRegex = new RegExp(subreddits[i].keywords.join('|'), 'gi')
    for (const post of feed.items) {
      if (post.title.match(keywordsRegex)) {
        sendNotification(post, subreddits[i])
      }
    }
  }
}

// Check reddit every hour
setInterval(checkReddit, 3600000)

module.exports = { checkReddit }



