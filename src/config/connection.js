const MongoClient = require("mongodb");
const catalogRequest = require('../controllers/slackbotController');
const config = require("../config/config");

MongoClient.connect(
  config.SLACKBOT_URI,
  { w: 1, j: false, wtimeout: 3000, useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50 }
)
  .catch(err => {
    console.error(err.stack);
    process.exit(1)
  })
  .then(async client => {
    await catalogRequest.injectDB(client);
    console.log("connected to DB");
  });