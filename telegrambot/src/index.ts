import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import invariant from "tiny-invariant";
import twilio from "twilio";
import { Configuration, OpenAIApi } from "openai";
import { brotliCompressSync } from "zlib"
import fs from "fs";
import mysql from 'mysql'
import * as cron from 'cron';
import express from "express";







const chatHistoryFile = "chatHistory.json";

interface ChatHistory {
  [userId: string]: unknown[];
}

function saveChatHistory(chatHistory: unknown[], userId: number): void {
  let chatHistoryData: ChatHistory = {};
  try {
    const data = fs.readFileSync(chatHistoryFile);
    const dataString = data.toString();
    chatHistoryData = JSON.parse(dataString);
  } catch (err) {
    // If file doesn't exist, don't do anything
  }
  chatHistoryData[userId.toString()] = chatHistory;
  const data = JSON.stringify(chatHistoryData);
  fs.writeFileSync(chatHistoryFile, data);
}

function loadChatHistory(userId: number): any[] {
  try {
    const data = fs.readFileSync(chatHistoryFile);
    const dataString = data.toString();
    const chatHistoryData = JSON.parse(dataString) as ChatHistory;
    return chatHistoryData[userId.toString()] ?? [];
  } catch (err) {
    return [];
  }
}




config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const token = process.env.TELEGRAM_BOT_TOKEN
const app = express();

const openai = new OpenAIApi(configuration)
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


invariant(token, "Couldn't read the token the enviroment variable")

const bot = new TelegramBot(token, {polling: true});
bot.setWebHook(`https://makingchanges.prodev.app/${token}`);
app.post("/webhook", (req, res) => {
  const data = req.body; // Assuming data is sent in the request body
  const chatId = "-810583708"; // Replace with the chat ID you want to send the data to

  // Use the bot instance to send the data to the chat
  bot.sendMessage(chatId, JSON.stringify(data));

  res.sendStatus(200); // Send a response to the webhook to acknowledge receipt of data
});

app.listen(3000, () => {
  console.log("Webhook server started");
});


bot.on("message", async (msg) => {
   if (!msg.text || msg.text.trim() === "")  {
        return;
    }
 
     

   if (msg.text && msg.text.startsWith("/text")) {
    const parts = msg.text.split(" ");
    if (parts.length >= 3) {
      const destinationNumbers = parts[1].split(",");
      const message = parts.slice(2).join(" ");

      destinationNumbers.forEach((destinationNumber) => {
        client.messages.create({
          to: destinationNumber.trim(),
          from: process.env.TWILIO_PHONE_NUMBER,
          body: message,
        }, (err, _) => {
          if (err) {
            bot.sendMessage(msg.chat.id, "There was an error sending the SMS message: " + err.message);
          } else {
            bot.sendMessage(msg.chat.id, "SMS message sent to " + destinationNumber);
          }
        });
      });
    } else {
      bot.sendMessage(msg.chat.id, "Please provide destination numbers separated by commas and a message after /text.");
    }
  }
    if (msg.text.startsWith("/image")) {
        return;
    }
    if (msg.text.startsWith("/t")) {
        return; }
        
    if (msg.text.startsWith("/text")) {
        return;
    }
     if (msg.text.startsWith("/start")) {
        return; }
        if (msg.text.startsWith("/stop")) {
        return; }

    if (msg.text.startsWith("/sms")) {
        const parts = msg.text.split(" ");
        if (parts.length >= 3) {
            const destinationNumber = parts[1];
            const message = parts.slice(2).join(" ");

            const baseCompletion = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: `${message}.\n`,
                temperature: 0.8,
                max_tokens: 1000,
            })


            const chatId = msg.chat.id

            const basePromptOuput = baseCompletion.data.choices.pop()
            const time = new Date();
            
saveChatHistory([...loadChatHistory(msg.chat.id), msg], msg.chat.id);


           if (!basePromptOuput || !basePromptOuput.text) {
                return bot.sendMessage(chatId, "Please try again, AI couldn't send the data")
            }

            client.messages.create({
                to: destinationNumber,
                from: process.env.TWILIO_PHONE_NUMBER,
                body: basePromptOuput.text,
            }, (err, _) => {
                if (err) {
                    bot.sendMessage(chatId, "There was an error sending the SMS message: " + err.message);
                } else {
                    bot.sendMessage(chatId, "SMS message sent!");
                }
            });
        } else {
            bot.sendMessage(msg.chat.id, "Please provide a destination number and a message after /sms.");
        }
    } else {
        const baseCompletion = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `${msg.text}.\n`,
            temperature: 0.8,
            max_tokens: 1000,
        })

        const chatId = msg.chat.id

        const basePromptOuput = baseCompletion.data.choices.pop()

        if(!basePromptOuput?.text) {
            return bot.sendMessage(chatId, "Please try again, AI couldn't send the data")
        }

        bot.sendMessage(chatId, basePromptOuput.text, {reply_to_message_id: msg.message_id});
    }
});

bot.on("error", (err) => console.log(err));