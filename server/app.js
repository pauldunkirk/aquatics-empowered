require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const portDecision = process.env.PORT || 3000;
const facilities = require('./routes/facilities');
const radar = require('./routes/radar');
const bodyParser = require('body-parser');
let isLocal = require('./config/config.js').local;

app.get('/', (req, res) => res.sendFile(path.resolve('server/public/index.html')));
app.get('/local', (req,res) => res.send(isLocal));

app.use(express.static('server/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/facilities', facilities);
app.use('/radar', radar);

app.listen(portDecision, () => console.log("Listening on port:", portDecision));
