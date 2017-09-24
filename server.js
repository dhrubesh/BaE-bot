var express = require('express')
var app = express()
require('dotenv').config()
var request = require('request');
const fetch = require('node-fetch');
const GIPHY_URL = `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=`;
const MEME_URL = `http://belikebill.azurewebsites.net/billgen-API.php?default=1&name=`

app.get('/', function (req, res) {
  res.send()
})
var bodyParser = require('body-parser')

var app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
const server = app.listen(8080, () => {
  console.log('Express server listening on port 8080');
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.verify_token) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook', function (req, res) {
  var data = req.body;
    // console.log(req.body)
    // console.log(res)
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});
  
function receivedMessage(event) {
  // Putting a stub for now, we'll expand it in the following steps
  console.log("Message data: ", event.message);
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
//   console.log(messageText)
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}
function sendGenericMessage(recipientId, messageText) {
  // To be expanded in later sections
}

function sendTextMessage(recipientId, messageText) {
    // console.log(messageText.slice(0,3))
    // console.log(messageText.length)
    //  img_url = ''
    var gif = messageText.slice(0,3).toLowerCase();
    var meme = messageText.slice(0,4).toLocaleLowerCase();
    var name = messageText.slice(5,messageText.length)
    console.log(name)
    var query = messageText.slice(3,messageText.length)
    if(gif == 'gif'){
        fetch(GIPHY_URL + query)
        .then(res => res.json())
        .then(json => {
            img_url = ''
            img_url = json.data.image_url
            // console.log(json.data.image_url)
          });
          console.log(img_url)
          
        //   console.log(query)
         if(img_url){ 
             var messageData = {
            recipient: {
              id: recipientId
            },
            //  "sender_action":"typing_on",
            "message":{
                "attachment":{
                  "type":"image",
                  "payload":{
                    "url":img_url
                      
                  }
                }
              }
          };
         }
    }else if(meme == 'meme'){
      var img_URL = MEME_URL + name
        if(img_URL){ 
               var messageData = {
              recipient: {
                id: recipientId
              },
              //  "sender_action":"typing_on",
              "message":{
                  "attachment":{
                    "type":"image",
                    "payload":{
                      "url":img_URL
                        
                    }
                  }
                }
            };
           }
    }
    else{
        var messageData = {
         recipient: {
           id: recipientId
         },
         message: {
           text: 'Yo! This is BaE. Search for a GIF by typing GIF followed by type.'
         }
      };
    }
  
  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.page_token },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}