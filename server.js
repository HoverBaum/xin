var express = require('express');
var app = express();
var http = require('http').Server(app);

var xin = require('xin-server')(http);

app.use(express.static('./'));

http.listen(3000, function() {
    console.log('listening on *:3000');
});
