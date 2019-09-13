// File: app.js
var express = require('express');
var app = express();  // Init an Express object.
app.get('/', function (req, res) { // Set page-gen fcn for URL root request.
    res.send('Hello World!'); // Send webpage containing "Hello World!".
});
app.listen(3000, function () { // Set callback action fcn on network port.
    console.log('App.js listening on port 3000!');
});
