const { WebClient } = require('@slack/web-api');
const menu = require('./config/menu');
const axios = require('axios');
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_HOOK_URL = process.env.SLACK_HOOK_URL;
const slackbot = require('./controllers/slackbotController');

// Helper functions
function nextOptionForAppointment(order) {
  const item = menu.items.find(i => i.id === order.type);
  if (!item) {
    throw new Error('This menu item was not found.');
  }
  return item.options.find(o => !Object.prototype.hasOwnProperty.call(order.options, o));
}

function isAppointmentComplete(order) {
  return !nextOptionForAppointment(order);
}



function capitalizeFirstChar(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Bot
// TODO: remove
const slackClientOptions = {};
if (process.env.SLACK_ENV) {
  slackClientOptions.slackAPIUrl = process.env.SLACK_ENV;
}
const bot = {
   userResponse: {},
  setUserResponse(key, val) {
    this.userResponse[key] = val;
    
  }
  ,
  getUserResponse() {
    return this.userResponse;
  },
  web: new WebClient(SLACK_TOKEN),
  orders: {},
  introduceToUser(userId) {
    this.web.chat.postMessage({
      channel: userId.channel, text: 'Welcome. How are you doing?\n',
      attachments: [
        {
          color: '#5A352D',
          title: '',
          callback_id: 'order:start',
          actions: [
            {
              name: 'start',
              text: 'Feeling lucky',
              type: 'button',
              value: 'order:feeling-lucky',
            },
            {
              name: 'start',
              text: 'Doing Well',
              type: 'button',
              value: 'order:doing-well',
            },
            {
              name: 'start',
              text: 'Neutral',
              type: 'button',
              value: 'order:neutral',
            },
          ],
        },
      ],
    })
      .catch(console.error);
  },

  startAppointment(userId) {

    // if (this.orders[userId.user.id]) {
    //   return Promise.resolve({
    //     channel: userId.channel,
    //     text: 'I\'m already busy with you, please be patient',
    //     replace_original: false,
    //   });
    // }

    // Initialize the order
    this.orders[userId.user.id] = {
      options: {},
    };

    return Promise.resolve({
      channel: userId.channel,
      text: 'when are you free this week for a walk??',
      attachments: [
        {
          color: '#5A352D',
          callback_id: 'order:select_day',
          text: '', // attachments must have text property defined (abstractable)
          actions: [
            {
              name: 'select_day',
              type: 'select',
              options: menu.listOfTypes(),
            },
          ],
        },
      ],

    });
  },

  openUserDigitsSelect(userId) {
    try {
      const order = this.orders[userId.user.id];
      // TODO: what happens if this throws?
      const optionId = nextOptionForAppointment(order);

      return Promise.resolve(
        {
          channel: userId.channel, text: 'What are the first 3 digits on the number scale?\n',
          mrkdwn: true,
          attachments: [
            {
              color: '#5A352D',
              title: '',
              callback_id: 'order:select_number_scale',
              actions: [
                {
                  name: 'select_number_scale',
                  type: 'select',
                  options: menu.listOfHours(optionId),

                }
              ],
            },
          ],
        }
      ).catch(error => console.log(error));
    } catch (error) {
      console.error(error);
    }


  },

  openThankYou(userId, optionId, optionValue) {
    const order = this.orders[userId];

    return this.bookAppointment(userId);
  },
  logAppointmentDetails(userId) {
    const order = this.orders[userId.user.id];
    return Promise.resolve(
      {
        channel: userId.channel, replace_original: true, text: 'Thank you!',

      }
    ).catch(error => console.log(error));
  },

  openSelectForUserHobies(userId) {
    const order = this.orders[userId.user.id];

    const optionId = nextOptionForAppointment(order);

    return Promise.resolve(
      {
        channel: userId.channel, text: 'What are your favorite hobbies? n',
        attachments: [
          {
            color: '#5A352D',
            title: '',
            callback_id: 'order:select_hobby',
            actions: [
              {
                name: 'hobby',
                text: 'Football',
                type: 'button',
                value: 'order:football',
              },
              {
                name: 'hobby',
                text: 'Music',
                type: 'button',
                value: 'order:music',
              },
              {
                name: 'hobby',
                text: 'Sleep',
                type: 'button',
                value: 'order:sleep',
              },
              {
                name: 'hobby',
                text: 'Movies',
                type: 'button',
                value: 'order:movies',
              },
              {
                name: 'hobby',
                text: 'Basketball',
                type: 'button',
                value: 'order:basketball',
              },
            ],
          },
        ],
      }
    ).catch(error => console.log(error));
  },

  selectAppointmentDay(userId, itemId) {
    const order = this.orders[userId];
    if (!order) {
      return Promise.resolve({
        text: 'Sorry, i cannot find that appoint. Message me to start a new appointment.',
        replace_original: false,
      });
    }
    order.type = itemId;

    if (!isAppointmentComplete(order)) {
      return this.selectUserAppointmentTime(userId);
    }
    return this.bookAppointment(userId);
  },



  selectUserHobby(userId, itemId) {

    const order = this.orders[userId.user.id];

    if (!order) {
      return Promise.resolve({
        text: 'I cannot find that order. Message me to start a new order.',
        replace_original: false,
      });
    }
    if (!order) {
      return Promise.resolve({
        channel: userId.channel,
        text: 'Sorry, i cannot find that appoint. Message me to start a new appointment.',
        replace_original: false,
      });
    }

    if (!isAppointmentComplete(order)) {
      return this.openSelectForUserHobies(userId);
    }
    return this.bookAppointment(userId);
  },

  selectTypeForDigitScale(userId, itemId) {

    const order = this.orders[userId.user.id];
    if (!order) {
      return Promise.resolve({
        text: 'I cannot find that order. Message me to start a new order.',
        replace_original: false,
      });
    }


    if (!order) {
      return Promise.resolve({
        channel: userId.channel,
        text: 'Sorry, i cannot find that appoint. Message me to start a new appointment.',
        replace_original: false,
      });
    }

    if (!isAppointmentComplete(order)) {
      return this.openUserDigitsSelect(userId);
    }
    return this.bookAppointment(userId);
  },

  selectUserAppointmentTime(userId) {
    const order = this.orders[userId];
    const optionId = nextOptionForAppointment(order);
    return Promise.resolve({
      text: 'Which day of the week?',
      attachments: [
        {
          color: '#5A352D',
          callback_id: 'order:select_time',
          text: ``,
          actions: [
            {
              name: 'select_time',
              type: 'select',
              options: menu.listOfHours(optionId),
            },
          ],
        },
      ],
    });
  },


  selectOptionForOrder(userId, optionId, optionValue) {
    const order = this.orders[userId];
    if (!order) {
      return Promise.resolve({
        text: 'I cannot find that order. Message me to start a new order.',
        replace_original: false,
      });
    }

    order.options[optionId] = optionValue;

    if (!isAppointmentComplete(order)) {
      return this.selectUserAppointmentTime(userId);
    }
    return this.bookAppointment(userId);
  },


  bookAppointment(userId) {
    const order = this.orders[userId.user.id];
    let params = this.getUserResponse();
    params['username']=userId.user.id;

    // save the appointment details to the DB
    slackbot.createSlackAppointment(this.getUserResponse());

    return axios.post(SLACK_HOOK_URL, {
      channel: userId.channel,
      text: `<@${userId.user.id}> your appointment  was successfully. Thank you`,

    }).then(() => {
      
      return Promise.resolve({
      text: `Your Appointment selections!`,
    });});
  },

  handleDirectMessage(message) {
    if (!this.orders[message.user.id]) {
      // this.introduceToUser(message);
    } else {
      this.web.chat.postMessage({ channel: message.channel, text: 'Let\'s keep working on the open order.' })
        .catch(console.error);
    }
  },
};

module.exports = bot;