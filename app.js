'use strict';

var express = require('express');
var multer = require('multer');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var extend = require('extend');
var path = require('path');
var async = require('async');
var classList = "";
// watson sdk
var uuid = require('uuid');
// var bundleUtils = require('./config/bundle-utils');
var os = require('os');
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var visualRecognition = new VisualRecognitionV3({
  version: '2018-03-19',
  iam_apikey: '0Q_5QstW31f432rOVHawA4IqCklaI07fn3w4dJzP9E3A',
  url: 'https://gateway.watsonplatform.net/visual-recognition/api'
});



var ONE_HOUR = 3600000;
var FOURTY_SECONDS = 40000;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
app.get('/services.html', function (req, res) {
  res.sendFile(__dirname + '/views/services.html');
});
app.get('/contact.html', function (req, res) {
  res.sendFile(__dirname + '/views/contact.html');
});
app.get('/about.html', function (req, res) {
  res.sendFile(__dirname + '/views/about.html');
});

// Bootstrap application settings
require('./config/express')(app);
app.engine('html', require('ejs').renderFile);
app.use(bodyParser());
// app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

/**
 * Parse a base 64 image and return the extension and buffer
 * @param  {String} imageString The image data as base65 string
 * @return {Object}             { type: String, data: Buffer }
 */

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({
  storage: storage
}).single("images_file")

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/views/services.html');
});

/**
 * Classifies an image
 * @param req.body.url The URL for an image either.
 *                     images/test.jpg or https://example.com/test.jpg
 * @param req.file The image file.
 */

app.post('/', (req, res) => {


  upload(req, res, (err) => {
    if (err) {
      return res.end("Something went wrong!")
    } else {
      console.log(req.file);

      var owners = ["me"];
      var params = {
        images_file: fs.createReadStream(__dirname + '/public/uploads/' + req.file.filename),
        owners: owners
      }

      visualRecognition.classify(params, function (err, results) {



        if (err)
          console.log(err);
        else {
          console.log("Response: " + JSON.stringify(results, null, 2));
          var classifiers = results.images[0].classifiers;

          classifiers.forEach(function (element) {
            if (classList != "")
              classList += ", "
            var classes = element.classes;
            console.log("Classes: " + JSON.stringify(classes));
            classList = JSON.stringify(classes);
          });
          res.render("services.html", { classList: classList });
          if (req.file)
            fs.unlink('public/uploads/' + req.file.filename, (err) => {
              if (err) throw err;
            });

        }

      }
      )
    };



  })



})

module.exports = app;