import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import cors from 'cors';
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import { configureSheets } from "./config/sheets.js";
import { createSheetService } from "./config/sheetService.js";
import { createTankController } from "./controller/createTankController.js"
import automateRouter from "./routes/automate.js";

dotenv.config();

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'https://watertankmanagement.onrender.com'], credentials: true }));

app.use(cookieParser());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename) || path.resolve();

const sheets = configureSheets();
const sheetService = createSheetService(sheets, process.env.SPREADSHEET_ID);
const tankController = createTankController(sheetService);

// Sample data for devices (You can replace this with your own data fetching logic)
const devices = [
    { id: 'ESP1', status: 'Online', waterLevel: '70%' },
    { id: 'ESP2', status: 'Offline', waterLevel: 'N/A' },
];

// New Route to Serve Device Status Data
app.get("/api/devices", (req, res) => {
    res.json({ devices });
});

//Routes
app.use("/", authRouter);
app.use("/automate", automateRouter);

app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (_, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "dist", "index.html"));
});

app.listen(3000, () => { 
    connectDB();
    console.log("server started at http://localhost:3000");
});
