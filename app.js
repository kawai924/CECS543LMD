// File: app.js
var express = require('express');
var app = express();  // Init an Express object.
var path = require('path')
var getArtifactId = require('./helpers/artifact');

// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, '/public/')));

//make port available to be a variable
var port = process.env.PORT || 3000;

var index = require('./routes/index');
app.use('/', index);



//Extra features after this point
//reading dir in import
var fs = require('fs');
function getFiles (dir, files_){
    fs = fs || require('fs');
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

//get function on the url
app.get('/test',  function (req, res) { // Set page-gen fcn for URL root request.
    //res.send('Hello Liam Matt and Marco!'); // Send webpage containing "Hello World!".
    dirlist = getFiles('./import');
    var list = '<p>';
    for(let file of dirlist) {
        list = list + file+'</br>';
    }
    list = list +'</p>';
    res.send(list);
    
});

app.listen(port, function () { // Set callback action fcn on network port.
    console.log('App.js listening on port '+port);
});


