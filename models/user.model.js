import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    emailId: {
        type: String,
        required: true,
        trim:true
    },
    password: {
        type: String,
        required: true,
        trim:true
    },
}, {
    timestamps:true,
});

const User = mongoose.model("User", userSchema);
export default User;