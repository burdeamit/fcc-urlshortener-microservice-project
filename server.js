require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const validator = require("validator");
// const bodyParser = require('body-parser');

// DB Packages
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// NANOID package config
const { customAlphabet } = require("nanoid");
const alphabet = "0123456789";
const nanoid = customAlphabet(alphabet, 5);

// Port Configuration
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB connection confirmation and error handling
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("MongoDB connection established \n"));

// URL schema
const urlSchema = new Schema({
  original_url: String,
  short_url: String,
});

// URL schema model
const Url = mongoose.model("Url", urlSchema);

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// ShortURL api endpoint
app.get("/api/shorturl/:urlInput", function (req, res) {
  console.log("get method : \n");
  console.log(req.params);
  let urlFetch = Url.findOne(
    { short_url: req.params.urlInput },
    (err, fetchResult) => {
      if (fetchResult) {
        res.redirect(fetchResult.original_url);
      } else {
        res.send("no such thing");
      }
    }
  );
});

// POST method ShortURL
app.post("/api/shorturl", function (req, res) {
  var requestedUrl = req.body.url;
  var shortUrlCode = nanoid();
  let searchResult;

  if (
    !validator.isURL(requestedUrl, {
      protocols: ["http", "https"],
      require_protocol: true,
    })
  ) {
    res.json({ error: "invalid url" });
  } else {
    let searchURLCollection = Url.findOne(
      { original_url: requestedUrl },
      (err, searchResult) => {
        if (searchResult) {
          res.json(searchResult);
        } else {
          requestForNewUrl = new Url({
            original_url: requestedUrl,
            short_url: shortUrlCode,
          });
          requestForNewUrl.save();
          res.json({
            original_url: requestForNewUrl.original_url,
            short_url: requestForNewUrl.short_url,
          });
        }
      }
    );
  }
});

// Listen to PORT
app.listen(port, function () {
  console.log(`Server running, listening on port ${port} \n`);
});
