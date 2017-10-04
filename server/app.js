require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const portDecision = process.env.PORT || 3000;
const facilities = require('./routes/facilities');
const placeIds = require('./routes/placeIds');
const bodyParser = require('body-parser');
let isLocal = require('./config/config.js').local;

app.get('/', (req, res) => res.sendFile(path.resolve('server/public/index.html')));

// app.set('/setLocal', () => {
//   res.locals.configPath = './config/local.js';
//   isLocal = true;
// });
//
// app.set('/setHeroku', () => {
//   res.locals.configPath = './config/heroku.js';
//   isLocal = false;
// });
app.get('/local', (req,res) => res.send(isLocal));
app.use(express.static('server/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/facilities', facilities);
app.use('/placeIds', placeIds);

// all server routes will have be processed by the token decoder first.
// therefore all inbound AJAX requests require the Firebase token in the header
// app.use(decoder.token);

app.listen(portDecision, () => console.log("Listening on port:", portDecision));

// const bigList = require('../bigList');
// app.get('/bigList', (req,res) => res.send(bigList));
