import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/user.model.js";  // Adjust the path if needed

dotenv.config(); // Load environment variables

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const users = [
    { emailId: "user1@example.com", password: "password123" },
    { emailId: "user2@example.com", password: "securepass" },
    { emailId: "user3@example.com", password: "testpass123" },
    { emailId: "user4@example.com", password: "mypassword" },
    { emailId: "user5@example.com", password: "pass12345" },
    { emailId: "user6@example.com", password: "letmein" },
    { emailId: "user7@example.com", password: "helloWorld" },
    { emailId: "user8@example.com", password: "secretpass" },
    { emailId: "user9@example.com", password: "access123" },
    { emailId: "user10@example.com", password: "adminpass" },
];

const insertUsers = async () => {
    try {
        // Hash passwords before inserting
        for (let user of users) {
            const existingUser = await User.findOne({ emailId: user.emailId });
            if (!existingUser) {  // Prevent duplicate entries
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await User.create({ emailId: user.emailId, password: hashedPassword });
                console.log(`User ${user.emailId} added successfully`);
            } else {
                console.log(`User ${user.emailId} already exists, skipping...`);
            }
        }
    } catch (error) {
        console.error("Error inserting users:", error);
    } finally {
        mongoose.disconnect(); // Close the connection after execution
    }
};

insertUsers();
