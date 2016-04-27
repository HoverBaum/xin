/**
 *   A server to provide files when testing.
 */
var express = require('express');
var app = express();

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Pass to next layer of middleware
    next();
});

app.use(express.static('./test'));

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
