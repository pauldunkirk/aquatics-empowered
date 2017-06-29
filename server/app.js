var express = require('express');
var app = express();

app.use(express.static('server/public'));

app.listen(3000);
console.log("app.js is loaded & server listening to port 3000");