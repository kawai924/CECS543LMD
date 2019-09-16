// File: app.js
var express = require('express');
var app = express();  // Init an Express object.
var upload = require("express-fileupload");
var getArtifactId = require('./artifact');


app.use(upload());

//make port available to be a variable
var port = process.env.PORT || 3000;

app.get('/', function (req, res) { // Set page-gen fcn for URL root request.
    res.send('Hello Liam Matt and Marco!'); // Send webpage containing "Hello World!".
});

app.get("/file_upload", function(req, res) {
    res.sendFile(__dirname + "/file_upload.html");
});

app.post("/file_upload", function(req, res) {
    if(req.files) {
        var file = req.files.filename;
        var filename = file.name;
        console.log(req.files);
        

        // TODO create a directory for the project files? 
        file.mv('./import' + filename, (err) => {
            if (err) {
                console.log(err);
                res.send("An error occurred while processing your file");
            }
            else {
                let artifactName = getArtifactId(filename).then( (value) => {res.send(value)});
            }
        })
    }
});
app.listen(port, function () { // Set callback action fcn on network port.
    console.log('App.js listening on port '+port);
});
