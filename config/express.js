const express = require("express");
const path = require("path");
const config = require("./config");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("../routes");
const passport = require("../middleware/passport");
const cleanup = require("./db-cleanup");

// get app
const app = express();

// secure app http
app.use(helmet());

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: [`'self'`],
    imgSrc: [`'self'`, `data:`, `https:`, `thriftyprintbucket.s3.us-east-2.com`],
    scriptSrc: [`'self'`, `https://www.paypal.com`, `unsafe-inline`],
    scriptSrcElem: [`'self'`, `https://paypal.com`, `https://www.paypal.com`],
    baseUri: [`'self'`],
    fontSrc: [`'self'`, `https:`, `data:`],
    frameSrc: [`'self'`, 'https://www.sandbox.paypal.com/'],
    connectSrc: [`'self'`, `https://thriftyprintbucket.s3.us-east-2.amazonaws.com`, `https://www.sandbox.paypal.com`, `http://localhost:8080/`, `https://thriftyprint.io`],
    frameAncestors: [`'self'`],
    objectSrc: [`'none'`],
    scriptSrcAttr: [`'none'`],
    styleSrc: [`'self'`, `https:`, `'unsafe-inline'`],
  },
  reportOnly: false
}))

// allow cors
app.use(cors());

// logger
if (config.env === "development") {
  app.use(logger("dev"));
}

// get dist folder
const distDir = path.join(__dirname, "../dist/printing-site");

app.enable("trust proxy");

// use dist folder as hosting folder by express


// Allowing X-domain request
// var allowCrossDomain = function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control");

//   // intercept OPTIONS method
//   if ('OPTIONS' == req.method) {
//     res.send(200);
//   }
//   else {
//     next();
//   }
// };
// app.use(allowCrossDomain);

// parsing from api
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/modelFiles", express.static(path.join("modelFiles")));
app.use("/api/images", express.static(path.join("images")));


app.use(express.static(distDir));



// authenticate
app.use(passport.initialize());

// api router
app.use("/api/", routes);

// serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

module.exports = app;
