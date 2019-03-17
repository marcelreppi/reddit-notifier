const dotenv = require('dotenv')
dotenv.config()

const { fetchRSSFeeds, sendNotification } = require('./lib.js')

const subreddits = require('./subreddits.json').subreddits

async function go() {
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

setInterval(go, 60000)
