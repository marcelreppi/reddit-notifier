const bot = require("./bot.js")

const { checkReddit } = require("./crawler.js")

exports.handler = async (event) => {
  try {
    await checkReddit()
    // await sendNotification("Test", ["Serverless reddit-notifier is working"]) // For testing
    await bot.telegram.sendMessage(process.env.MY_CHAT_ID, "Serverless reddit-notifier: Successfully executed")
  } catch (error) {
    console.log(error)
    await bot.telegram.sendMessage(process.env.MY_CHAT_ID, "Serverless reddit-notifier: There was an error!\n\n" + String(error))
    const response = {
      statusCode: 500,
      body: JSON.stringify(error),
    };
    return response;
  }
  
  const response = {
    statusCode: 200,
    body: JSON.stringify("Reddalert executed"),
  };
  return response;
}