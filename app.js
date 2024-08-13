require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

const connectToDatabase = require("./config/db");
const userRouter = require("./routes/userRoutes");
const commentRouter = require("./routes/commentRoutes");

var app = express();

// enabling CORS for any unknown origin(https://xyz.example.com)
app.use(cors());

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Connect to the database
connectToDatabase();

// Routes
app.use("/api/comments", commentRouter);
app.use("/api/users", userRouter);

module.exports = app;
