const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const PORT = 3000;

const app = express();

const index = require("./routes/index.js");
const user = require("./routes/user");

// Set up middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public"))); // Serve static files
app.set("view engine", "pug");

// Routings
app.use("/", index);
app.use("/user", user);

// Server entry point
app.listen(PORT, () => console.log("Listening..."));
