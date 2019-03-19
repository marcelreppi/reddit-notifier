const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

bot.launch()

module.exports = bot