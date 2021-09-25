const TelegramBot = require("node-telegram-bot-api");

const BotUser = require("./models/bot-user");

const { TELEGRAM_BOT_TOKEN } = require("./helpers/const");

let bot;

module.exports = {
  init: () => {
    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

    bot.onText(/^\/subscribe|^subscribe/i, (msg) => {
      const chatId = msg.chat.id;

      BotUser.findOne({ chatId })
        .then((user) => {
          if (user) {
            bot.sendMessage(
              chatId,
              "You already subscribed for App notifications!"
            );
            return;
          }

          const newUser = new BotUser({ chatId });
          return newUser.save();
        })
        .then((user) => {
          if (user) {
            bot.sendMessage(
              chatId,
              "You successfully subscribed for App notifications!"
            );
          }
        })
        .catch((err) => {
          console.error(err);
        });
    });

    bot.onText(/^\/unsubscribe|^unsubscribe/i, (msg) => {
      const chatId = msg.chat.id;

      BotUser.findOne({ chatId })
        .then((user) => {
          if (!user) {
            bot.sendMessage(chatId, "You are not subscribed to notifications!");
            return;
          }

          return BotUser.findOneAndRemove({ chatId });
        })
        .then((user) => {
          if (user) {
            bot.sendMessage(
              chatId,
              "You successfully unsubscribed from App notifications!"
            );
          }
        })
        .catch((err) => {
          console.error(err);
        });
    });

    bot.on("message", (msg) => {
      if (msg.text.match(/^\/start|^start/i)) {
        bot.sendMessage(
          msg.chat.id,
          "Welcome to NodeJS + Express App notifier! Click on subscribe to get possible App notifications!",
          {
            reply_markup: {
              resize_keyboard: true,
              keyboard: [["Subscribe", "Unsubscribe"]],
            },
          }
        );
      } else if (
        !msg.text.match(/^\/subscribe|^subscribe|^\/unsubscribe|^unsubscribe/i)
      ) {
        bot.sendMessage(
          msg.chat.id,
          `Use only special commands to work with bot: 
          For notification subscribe - /subscribe 
          To unsubscribe - /unsubscribe`,
          {
            reply_markup: {
              resize_keyboard: true,
              keyboard: [["Subscribe", "Unsubscribe"]],
            },
          }
        );
      }
    });

    return bot;
  },
  getBot: () => {
    if (!bot) {
      throw new Error("Telegram bot not initialized!");
    }

    return bot;
  },
};
