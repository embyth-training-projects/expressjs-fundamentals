const { Schema, model } = require("mongoose");

const botUserSchema = new Schema({
  chatId: {
    type: Number,
    required: true,
  },
});

module.exports = model("BotUser", botUserSchema);
