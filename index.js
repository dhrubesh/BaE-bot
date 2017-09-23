'use strict';
const BootBot = require('bootbot');

require('dotenv').config()
const bot = new BootBot({
  accessToken: process.env.page_token,
  verifyToken: process.env.verify_token,
  appSecret: process.env.secret
});

bot.on('message', (payload, chat) => {
	const text = payload.message.text;
	console.log(`The user said: ${text}`);
});

bot.hear(['hello', 'hi', /hey( there)?/i], (payload, chat) => {
	console.log('The user said "hello", "hi", "hey", or "hey there"');
});
bot.start();