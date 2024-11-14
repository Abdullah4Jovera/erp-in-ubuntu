const twilio = require('twilio');
const axios = require('axios');

const accountSid = 'AC9f10e22cf1b500ee219526db55a7c523'; // Your Twilio Account SID
const authToken = 'd23214875886a2ce7c3412863d5fe541'; // Your Twilio Auth Token

const client = twilio(accountSid, authToken);

async function getMedia(messageSid, mediaSid) {
    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageSid}/Media/${mediaSid}`;
        const response = await axios.get(url, {
            auth: {
                username: accountSid,
                password: authToken,
            },
            responseType: 'arraybuffer', // Retrieve media as binary data
        });
        
        return {
            body: response.data,
            headers: response.headers // Return headers along with the data
        };
    } catch (error) {
        throw new Error('Failed to fetch media from Twilio: ' + error.message); // Include error message for debugging
    }
}

module.exports = {
    getMedia,
};
