# Message Menus API Sample for Node

[Message menus](https://api.slack.com/docs/message-menus) are a feature of the Slack Platform that allow your Slack app to display a set of choices to users within a message.



## Setup

### Create a Slack app

To start, create an app at [api.slack.com/apps](https://api.slack.com/apps) and configure it with a bot user, event subscriptions, interactive messages, and an incoming webhook. This sample app uses the [Slack Event Adapter](https://github.com/slackapi/node-slack-events-api), where you can find some configuration steps to get the Events API ready to use in your app.


### Bot user

Click on the Bot user feature on your app configuration page. Assign it a username (such as
`@chatbot`), enable it to be always online, and save changes.

### Event subscriptions

Turn on Event Subscriptions for the Slack app. You must input and verify a Request URL, and the easiest way to do this is to [use a development proxy as described in the Events API module](https://github.com/slackapi/node-slack-events-api#configuration). The application listens for events at the path `/slack/events`:

- ngrok or Glitch URL + `/slack/events`

Create a subscription to the team event `app_mention` and a bot event for `message`. Save your changes.

### Interactive Messages
Click on `Interactive Messages` on the left side navigation, and enable it. Input your *Request URL*:

- ngrok or Glitch URL + `/slack/actions`

_(there's a more complete explanation of Interactive Message configuration on the [Node Slack Interactive Messages module](https://github.com/slackapi/node-slack-interactive-messages#configuration))._

### Incoming webhook

Create a channel in your development team. Add an incoming webhook to your app's configuration and select this team. Complete it by authorizing the webhook on your team.

### Environment variables

You should now have a Slack verification token (basic information), access token, and webhook URL (install app). 



**If you're developing locally:**

1. Create a new file named `.env` within the directory and place the values as shown below
2. Download the dependencies for the application by running `npm install`. Note that this example assumes you are using a currently supported LTS version of Node (at this time, v6 or above).
3. Start the app (`nodemon serve`)


```
SLACK_SECRET_SIGNED = "XXXXXXXXXX"
SLACK_TOKEN = "xoxb-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
SLACK_HOOK_URL = "https://hooks.slack.com/services/XXXXXXX/XXXXX/XXXXXXXXX"
CLIENT_ID = "XXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXX"
CLIENT_SECRET ="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
SLACKBOT_URI = 'mongodb+srv://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
```


## Usage

Go ahead and DM `@chatbot` to see the app in action!
