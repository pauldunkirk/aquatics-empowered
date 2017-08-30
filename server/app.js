// require('dotenv').config();
var express = require('express');
var app = express();
var path = require('path');
var portDecision = process.env.PORT || 3000;
var fs = require('fs');
var facilities = require('./routes/facilities');

// app.listen(3000);
console.log("app.js is loaded & server listening to port 3000");

var poolList = require('../samples');
var bigList = require('../bigList');

var bodyParser = require('body-parser');

app.get('/', function(req, res){
  res.sendFile(path.resolve('server/public/index.html'));
});

app.get('/poolList', function(req, res) {
  res.send(poolList);
});

app.get('/bigList', function(req, res) {
  res.send(bigList);
});

app.use(express.static('server/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/facilities', facilities);

// all server routes will have be processed by the token decoder first.
// therefore all inbound AJAX requests require the Firebase token in the header
// app.use(decoder.token);

app.listen(portDecision, function(){
  console.log("Listening on port: ", portDecision);
});
