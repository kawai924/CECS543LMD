var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var ft = require('../helpers/folderTree');
var path = require('path');



router.use(bodyParser());
// var parser = bodyParser.urlencoded({extended: false});

router.get('/', function(req, res, next) {
    var path = 'index.html';
    var options = {
        root : './public/app/'
    };
    res.sendFile(path, options, function(err){
        console.log(err)
    });
});


router.post('/', function(req, res, next) {
    console.log(req.body);
    
    var fullDirectory = req.body.repo;
    ft.copyFolderTree(fullDirectory, './import/' );
    // TODO Grab just the folder name?
    res.status(200).send('Repo created for folder: ', fullDirectory);
});

// router.get('/', function (req, res) { // Set page-gen fcn for URL root request.
//     res.sendFile(__dirname + "/index.html"); // Send home webpage
// });

router.get("/file_upload", function(req, res) {
    res.sendFile(__dirname + "/file_upload.html");
});

router.post("/file_upload", function(req, res) {
    // TODO create a directory for the project files?
    if(req.files) {
        var file = req.files.filename;
        var filename = file.name;
        console.log(req.files);
        let artifactName = getArtifactId(filename).then( (value) => {
            file.mv('./import/' + value, (err) => {
                if (err) {
                    console.log(err);
                    res.send("An error occurred while processing your file");
                }
                else {
                    res.send(`${filename} was uploaded.`)
                }
            })
        });   
    }
});

module.exports = router;