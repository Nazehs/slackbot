const config = require('../config/config');

let slackbotInstance;

class slacbotController {

    // connect to db
    /**
     * @param  {} conn connection instance
     */
    static async injectDB(conn) {
        if (slackbotInstance) {
            return
        }
        try {

            slackbotInstance = await conn.db(config.SLACKBOT_NS).collection('appointments');

        } catch (e) {
            console.error(`Unable to establish a collection handle in appointment  collection: ${e}`)
        }
    }
    /**
     * @param  {} req
     * @param  {} res
     */
    static async createSlackAppointment(params) {

        try {

           let doc = await  slackbotInstance.insertOne(params)
            // .then((doc) => {
            //     return({
            //         status: 0,
            //         success: true,
            //         message: doc.ops[0]
            //     });

            // })
            return doc;


        } catch (error) {
          console.log(error);

        }

    }
    /**
     * @param  {} req
     * @param  {} res
     */
    static async getSlackAppointments(req, res) {
        try {

            let doc = await slackbotInstance.findOne({ username: req.body.username });
            res.send({
                status: 0,
                message: doc,
                success: true
            });


        } catch (error) {
            res.status(500).send({
                status: 1,
                success: false,
                message: error.message

            });
        }

    }
    /**
     * @param  {} req
     * @param  {} res
     */
    static async getUserSlackAppointments(req, res) {
        try {

            let doc = await slackbotInstance.find({ username: req.params.username }).toArray();
            res.send({
                status: 0,
                message: doc,
                success: true
            });


        } catch (error) {
            res.status(500).send({
                status: 1,
                success: false,
                message: error.message

            });
        }

    }

}
module.exports = slacbotController;