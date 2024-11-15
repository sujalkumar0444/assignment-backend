const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

async function mongoDBConnect() {
    try {
        console.log("Trying to connect to MongoDB...");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

module.exports = {mongoDBConnect};
