import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { configureSheets } from "../config/sheets.js";
import { createSheetService } from "../config/sheetService.js";

const sheets = configureSheets();
const sheetService = createSheetService(sheets, process.env.SPREADSHEET_ID);

const authRouter = express.Router();
const app = express();
app.use(cookieParser());
app.use(express.json());

let activeUser = null;
let activeUserEmail = null;

authRouter.post("/login", async (req, res) => {
    try {


        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId });

        if (!user) {
            return res.status(400).json({
                message: "Invalid Credentials!"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {

            const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET_PASSWORD, { expiresIn: '1h' });
            
            res.cookie("token", token);
            
            return res.json({ message: "Login successful", data: { emailId: user.emailId } });

        } else {
            return res.status(400).json({message:"Invalid Credentials!"})
        }

    } catch (err) {
        return res.status(400).json({
            message:"Server Error " + err.message
        });
    }
});

authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(0),
    });
    activeUser = null;
    
    res.json({
        message: "Logged out Successfully"});
})

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET_PASSWORD);
        req.userId = decoded._id;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid Token" });
    }
};

const checkActiveUser = (req, res, next) => {
    if (activeUser && activeUser !== req.userId) {
        return res.status(403).json({ occupied: true, message: "Another user is already in edit mode." });
    }
    next();
};

authRouter.post("/enter-allTanks", authenticateUser, checkActiveUser, async(req, res) => {
    const { emailId } = req.body;  // Get the user who clicked the button
    if (!emailId) {
        return res.status(400).json({ message: "User email is required." });
    }
    const user = await User.findOne({ emailId }).select("emailId");

    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    if (activeUserEmail && activeUserEmail !== emailId) {
        return res.status(403).json({
            occupied: true,
            message: `Another user (${activeUserEmail}) is already in edit mode.`,
            activeUser: activeUserEmail
        });
    }

    // Allow the same user to enter from another device
    activeUserEmail = emailId;

    // if (activeUser) {
    //     const activeUserData = await User.findById(activeUser).select("emailId");
    //     return res.status(403).json({
    //         occupied: true, message: `Another user is already in edit mode.`,
    //         activeUser: activeUserData.emailId
    //     });
    // }

    // activeUser = req.userId;
    return res.json({ success: true, message: "Access granted." , user: user ? user.emailId : "Unknown"});

});

authRouter.post("/exit-allTanks", authenticateUser, async (req, res) => {
    
    const user = await User.findById(req.userId).select("emailId");
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

     if (activeUserEmail === user.emailId) {
        activeUserEmail = null;
        return res.status(200).json({ success: true, message: `${user.emailId} exited successfully.` });
    }
    
    return res.status(403).json({ message: `You are not the active user. Active user is ${user.emailId} `  });
});

authRouter.get("/check-allTanks", async(req, res) => {
    if (activeUser) {

        const user = await User.findById(activeUser).select("emailId");

        if (user) {
            return res.status(403).json({
                occupied: true,
                message: `Edit Mode is currently occupied by ${user.emailId}.`,
                activeUser: user.emailId
            });
        }
    }
    res.status(200).json({ occupied: false, message:"No user in Edit Mode" });
});

async function updateSheet(range, values) {
    try {
        const formattedValues = values.flat(); 

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: formattedValues },
        });
    } catch (error) {
        console.error("Error updating Google Sheet:", error);
        throw error;
    }
}

async function getLastRow(sheetName) {
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:A`, // Fetch only column A to determine the last row
        });

        const numRows = res.data.values ? res.data.values.length : 0;
        return numRows;
    } catch (error) {
        console.error("Error fetching last row:", error);
        throw error;
    }
}

authRouter.get("/get-last-row", async (req, res) => {
    try {
        const resData = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "status!A:A", // Get all values in column A (date/time)
        });

        const lastRow = resData.data.values ? resData.data.values.length : 0;
        res.status(200).json({ success: true, lastRow });

    } catch (error) {
        console.error("Error fetching last row:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

authRouter.post("/update-tank-status", async (req, res) => {

    if (!req.body || !req.body.range || !req.body.values) {
        return res.status(400).send({ success: false, message: "Missing required fields: range or values" });
    }

    try {

        const { range, values } = req.body;
        await sheetService.updateSheet(range, [values]);
        res.status(200).send({ success: true, message: "Sheet updated successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}
)



export default authRouter;
