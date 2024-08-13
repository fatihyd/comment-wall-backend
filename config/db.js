const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Successfully connected to the database!");
  } catch (error) {
    console.log("Database connection error:", error);
    process.exit(1); // Exit the process with a failure code
  }
};

module.exports = connectToDatabase;
