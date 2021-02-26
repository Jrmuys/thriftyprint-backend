const express = require("express");
const path = require("path");
const config = require("./config");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("../routes");
const passport = require("../middleware/passport");

// get app
const app = express();

// logger
if (config.env === "development") {
  app.use(logger("dev"));
}

// get dist folder
const distDir = path.join(__dirname, "../dist/printing-site");

app.enable("trust proxy");

// use dist folder as hosting folder by express
app.use(express.static(distDir));

app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    "default-src '*'; font-src 'self' https://fonts.gstatic.com; img-src 'self' http://* 'data'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'; style-src 'self' http://* 'unsafe-inline'; frame-src 'self'"
  );
  next();
});

// parsing from api
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/modelFiles", express.static(path.join("modelFiles")));
app.use("/api/images", express.static(path.join("images")));

// secure app http
app.use(helmet());

// allow cors
// app.use(cors());

// authenticate
app.use(passport.initialize());

// api router
app.use("/api/", routes);

// serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

module.exports = app;
