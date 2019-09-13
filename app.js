// File: app.js
var express = require('express');
var app = express();  // Init an Express object.

//make port available to be a variable
var port = process.env.PORT || 3000;

app.get('/', function (req, res) { // Set page-gen fcn for URL root request.
    res.send('Hello World!'); // Send webpage containing "Hello World!".
});
app.listen(port, function () { // Set callback action fcn on network port.
    console.log('App.js listening on port '+port);
});
