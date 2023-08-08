const mongoose = require("mongoose");

const config = require("config");
const uri = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
