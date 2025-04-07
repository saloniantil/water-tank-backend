// server/config/sheets.js
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

export const configureSheets = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,  // ✅ path to JSON file
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
};
