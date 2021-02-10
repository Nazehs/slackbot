const express = require('express');
const slackbot = require('../controllers/slackbotController');


const router = express.Router();

//creating new appointment
router.post('/slackbot/create',  slackbot.createSlackAppointment);

//get all appointments route
router.get('/slackbot/query/all', slackbot.getSlackAppointments);

//get user appointments route
router.get('/slackbot/query/:username', slackbot.getUserSlackAppointments);

module.exports = router;