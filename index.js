const { fetchRSSFeed, sendNotification } = require('./lib.js')

const subreddits = require('./subreddits.json').subreddits

async function checkReddit() {
  for (const sr of subreddits) {
    const feed = await fetchRSSFeed(sr.name)
    const keywordsRegex = new RegExp(sr.keywords.join('|'), 'gi')
    const matchingPosts = []
    for (const post of feed.items) { 
      if (post.title.match(keywordsRegex)) {
        matchingPosts.push(post.link)
      }
    }
    sendNotification(matchingPosts, sr.name)
  }
}

exports.handler = async (event) => {
  await checkReddit()
  await sendNotification('Serverless reddalert is working', 'Test') // For testing
  const response = {
    statusCode: 200,
    body: JSON.stringify('Reddalert executed'),
  };
  return response;
}