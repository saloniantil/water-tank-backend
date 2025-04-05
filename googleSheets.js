import dotenv from "dotenv";
const { google } = require("googleapis");

dotenv.config();

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

async function updateSheet(range, values) {
    try {
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range,
            valueInputOption: "USER_ENTERED",
            resource: { values: [values] },
        });
    } catch (error) {
        console.error("Error updating sheet:", error);
    }
}

module.exports = { updateSheet };
