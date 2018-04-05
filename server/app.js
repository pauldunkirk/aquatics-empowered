require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const portDecision = process.env.PORT || 3000;



app.use((req, res, next) => {
    if(req.header('x-forwarded-proto')) {
        if(req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    } else {
        next();
    }
});

app.get('/', (req, res) => res.sendFile(path.resolve('server/public/index.html')));

app.use(express.static('server/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.listen(portDecision, () => console.log("Listening on port:", portDecision));
