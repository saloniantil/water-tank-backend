import express from "express";
import { createTankController } from "../controller/createTankController.js";
import { configureSheets } from "../config/sheets.js";
import { createSheetService } from "../config/sheetService.js";
import dotenv from "dotenv";
dotenv.config();

const sheets = configureSheets();
const sheetService = createSheetService(sheets, process.env.SPREADSHEET_ID);
const tankController = createTankController(sheetService);

// Verify controller methods exist
if (!tankController?.handleStartMonitoring) {
    throw new Error("Tank controller methods not properly initialized");
}

const automateRouter = express.Router();
// Start tank monitoring
automateRouter.post("/start", tankController.handleStartMonitoring);

// Stop tank monitoring
automateRouter.post("/stop", tankController.handleStopMonitoring);

// Get current tank system status
automateRouter.get("/status", (req, res) => {
  res.status(200).json({
    success: true,
    data: tankController.getState()
  });
});

export default automateRouter;