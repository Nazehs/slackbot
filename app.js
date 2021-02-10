require('dotenv').config();

const { createServer } = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require('@slack/interactive-messages');
const cloneDeep = require('lodash.clonedeep');
const cors = require('cors');
const bot = require('./src/slackbot');
const api = require('./src/routes/api');
const connection = require('./src/config/connection')
const request = require('request-promise');
// Create the server
const app = express();

const SLACK_SECRET_SIGNED = process.env.SLACK_SECRET_SIGNED
const SLACK_TOKEN = process.env.SLACK_TOKEN;


const slackEvents = createEventAdapter(SLACK_SECRET_SIGNED);
const slackInteractions = createMessageAdapter(SLACK_SECRET_SIGNED);
slackInteractions.start().catch(error => console.log(error));

slackEvents.on('app_mention', (event) => {
  bot.introduceToUser(event);
});

slackEvents.on('message', (event) => {
  // Filter out messages from this bot itself or updates to messages
  if (event.subtype === 'bot_message' || event.subtype === 'message_changed') {
    return;
  }
  bot.handleDirectMessage(event);
});

// Helper functions

function findAttachment(message, actionCallbackId) {
  return message.attachments.find(a => a.callback_id === actionCallbackId);
}

function acknowledgeActionFromMessage(originalMessage, actionCallbackId, ackText) {
  const message = cloneDeep(originalMessage);
  const attachment = findAttachment(message, actionCallbackId);
  delete attachment.actions;
  attachment.text = `:white_check_mark: ${ackText}`;
  return message;
}

function findSelectedOption(originalMessage, actionCallbackId, selectedValue) {

  const attachment = findAttachment(originalMessage, actionCallbackId);
  return attachment.actions[0].options.find(o => o.value === selectedValue);
}



function findSelectedbuttons(originalMessage, actionCallbackId, selectedValue) {

  const attachment = findAttachment(originalMessage, actionCallbackId);
  return attachment.actions.find(o => o.value === selectedValue);
}
// Action handling

slackInteractions.action('order:start', (payload, respond) => {
  // Create an updated message that acknowledges the user's action (even if the result of that
  // action is not yet complete).
  const updatedMessage = acknowledgeActionFromMessage(payload.original_message, 'order:start',
    'I\'m getting your appointment started for you.');
    const selectedType = findSelectedbuttons(payload.original_message, 'order:start', payload.actions[0].value);

    // set the user user response 
    bot.setUserResponse("how_are_you", `${selectedType.text.toLowerCase()}`);
  // Start an order, and when that completes, send another message to the user.
  bot.startAppointment(payload)
    .then(respond)
    .catch(console.error);

  // The updated message is returned synchronously in response
  return updatedMessage;
});

slackInteractions.action('order:select_day', (payload, respond) => {
  const selectedType = findSelectedOption(payload.original_message, 'order:select_day', payload.actions[0].selected_options[0].value);
  const updatedMessage = acknowledgeActionFromMessage(payload.original_message, 'order:select_day',
    `Your appointment day is  *${selectedType.text.toLowerCase()}.*`);

    // set the user user response 
    bot.setUserResponse("appointment_day", `${selectedType.text.toLowerCase()}`);

  bot.selectAppointmentDay(payload.user.id, selectedType.value)
    .then((response) => {
      // Keep the context from the updated message but use the new text and attachment
      updatedMessage.text = response.text;
      if (response.attachments && response.attachments.length > 0) {
        updatedMessage.attachments.push(response.attachments[0]);
      }
      return updatedMessage;
    })
    .then(respond)
    .catch(console.error);

  return updatedMessage;
});

slackInteractions.action('order:select_time', (payload, respond) => {
  try {
    const selectedType = findSelectedOption(payload.original_message, 'order:select_time', payload.actions[0].selected_options[0].value);
    const updatedMessage = acknowledgeActionFromMessage(payload.original_message, 'order:select_time',
      `Your appointment time is  *${selectedType.text.toLowerCase()}*.`);

      // set the user user response 
    bot.setUserResponse("appointment_time", `${selectedType.text.toLowerCase()}`);

    bot.selectUserHobby(payload, selectedType.value).then(response => {
      updatedMessage.text = response.text;
      if (response.attachments && response.attachments.length > 0) {
        updatedMessage.attachments.push(response.attachments[0]);
      }
      return updatedMessage;
    })
      .then(respond)
      .catch(console.error);

    return updatedMessage;
  } catch (error) {

    console.log(`Time Error :::::: ${error}`);

  }

});

slackInteractions.action('order:select_number_scale', (payload, respond) => {

  try {
    const selectedType = findSelectedOption(payload.original_message, 'order:select_number_scale', payload.actions[0].selected_options[0].value);
    const updatedMessage = acknowledgeActionFromMessage(payload.original_message, 'order:select_number_scale',
      `Your number scale is  *${selectedType.text.toLowerCase()}*.`);
      // set the user user response 
    bot.setUserResponse("digit_scale", `${selectedType.text.toLowerCase()}`);

    bot.openThankYou(payload, selectedType.value)
      .then((response) => {
        // Keep the context from the updated message but use the new text and attachment
        updatedMessage.text = response.text;
        if (response.attachments && response.attachments.length > 0) {
          updatedMessage.attachments.push(response.attachments[0]);
        }
        return updatedMessage;
      })
      .then(respond)
      .catch(console.error);

    return updatedMessage;
  } catch (error) {

    console.log(`Number Scale error ::::: ${error}`)
  }

});


slackInteractions.action('order:select_hobby', (payload, respond) => {

  try {
    const selectedType = findSelectedbuttons(payload.original_message, 'order:select_hobby', payload.actions[0].value);

    const updatedMessage = acknowledgeActionFromMessage(payload.original_message, 'order:select_hobby',
      `Your hobby is  *${selectedType.text.toLowerCase()}*.`);

      // set the user user response 
    bot.setUserResponse("favorite_hobby", `${selectedType.text.toLowerCase()}`);

    bot.selectTypeForDigitScale(payload, selectedType.value)
      .then((response) => {
        // Keep the context from the updated message but use the new text and attachment
        updatedMessage.text = response.text;
        if (response.attachments && response.attachments.length > 0) {
          updatedMessage.attachments.push(response.attachments[0]);
        }
        return updatedMessage;
      })
      .then(respond)
      .catch(console.error);

    return updatedMessage;
  } catch (error) {
    console.log(`Hobby error ::::: ${error}`)
  }

});


app.use(cors());

app.use('/api', api);

app.use((err,req,res,next)=>{
    console.log(err);
    return next(err);
});

app.get('/', (req, res) =>{
  res.send({status:'running'});
});

app.get('/auth/redirect', (req, res) =>{
	var options = {
  		uri: 'https://slack.com/api/oauth.access?code='
  			+req.query.code+
  			'&client_id='+process.env.CLIENT_ID+
  			'&client_secret='+process.env.CLIENT_SECRET+
  			'&redirect_uri='+process.env.REDIRECT_URI,
		method: 'GET'
  	}
  	request(options, (error, response, body) => {
  		var JSONresponse = JSON.parse(body)
  		if (!JSONresponse.ok){
  			res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end()
  		}else{
  			res.send("Success!")
  		}
  	})
})

app.use('/slack/events', slackEvents.requestListener());

app.use('/slack/actions', slackInteractions.requestListener());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

module.exports = app;

