import { google } from "googleapis";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export const configureSheets = () => {
  let credentials;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS.startsWith("{")) {
    credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  } else {
    credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8"));
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
};