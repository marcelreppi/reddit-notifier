const { checkReddit } = require('./index.js')
const { sendNotification } = require('./lib.js')

exports.handler = async (event) => {
  await checkReddit()
  sendNotification({ link: 'Test' }, { name: 'Test' }) // For testing
  const response = {
    statusCode: 200,
    body: JSON.stringify('Reddit notifier executed'),
  };
  return response;
}