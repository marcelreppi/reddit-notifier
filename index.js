const { sendBotMsg } = require("./bot.js")

const { checkReddit } = require("./crawler.js")

exports.handler = async event => {
  await sendBotMsg("Executing lambda reddit-notifier")
  try {
    await checkReddit()
    // await sendNotification("Test", ["Serverless reddit-notifier is working"]) // For testing
    await sendBotMsg("Successfully executed lambda reddit-notifier")
  } catch (error) {
    await sendBotMsg(
      "Serverless reddit-notifier: There was an error!\n\n" + String(error)
    )
    const response = {
      statusCode: 500,
      body: JSON.stringify(error),
    }
    return response
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify("Reddalert executed"),
  }
  return response
}
