var express = require('express');
var app = express();

app.use(express.static('server/public'));

app.listen(3000);
