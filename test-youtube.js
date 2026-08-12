const { google } = require('googleapis');
require('dotenv').config({ path: './.env.local' });

async function testYouTube() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:3000"
    );
    
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    const res = await youtube.channels.list({
      part: 'snippet',
      mine: true
    });
    
    console.log("Success! Channels:", JSON.stringify(res.data.items, null, 2));
  } catch (error) {
    console.error("Error accessing YouTube API:");
    console.error(error.message);
  }
}

testYouTube();
