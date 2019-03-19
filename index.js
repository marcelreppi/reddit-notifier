const { fetchRSSFeed, sendNotification } = require('./lib.js')

const subreddits = require('./subreddits.json').subreddits

async function checkReddit() {
  for (const sr of subreddits) {
    const feed = await fetchRSSFeed(sr.name)
    const keywordsRegex = new RegExp(sr.keywords.join('|'), 'gi')
    const matchingLinks = []
    for (const post of feed.items) { 
      if (post.title.match(keywordsRegex)) {
        matchingLinks.push(post.link)
      }
    }
    if (matchingLinks.length > 0) sendNotification(sr.name, matchingLinks)
  }
}

exports.handler = async (event) => {
  await checkReddit()
  // await sendNotification('Test', ['Serverless reddit-notifier is working']) // For testing
  const response = {
    statusCode: 200,
    body: JSON.stringify('Reddalert executed'),
  };
  return response;
}