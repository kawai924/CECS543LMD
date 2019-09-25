// File: app.js
var express = require('express');
var app = express();  // Init an Express object.
var upload = require("express-fileupload");
var path = require('path')
var getArtifactId = require('./helpers/artifact');

app.use(upload());
// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, '/public/')));

//make port available to be a variable
var port = process.env.PORT || 3000;

var index = require('./routes/index');
app.use('/', index);


//JSToNode test
var testpage = require('./routes/JSToNode.html');
app.get('/test', function (req, res) { // Set page-gen fcn for URL root request.
    res.send('Hello World!'); // Send webpage containing "Hello World!".
});

//
app.listen(port, function () { // Set callback action fcn on network port.
    console.log('App.js listening on port '+port);
});


