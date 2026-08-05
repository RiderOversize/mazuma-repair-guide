require("dotenv").config({ path: ".env.local" });
const { google } = require("googleapis");

async function run() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "SymptomGroup!A1:Z1",
  });
  console.log(JSON.stringify(res.data.values, null, 2));
}
run().catch(console.error);
