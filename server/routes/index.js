const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const folderFuncs = require('../../helpers/FolderFunctions');
const path = require('path');
const constants = require('../constants.js');


router.use(bodyParser());

//Display index.html as home-page//
router.get('/', function(req, res, next) {
    return res.sendFile(path.join(constants.APPPATH, 'index.html'));
});

/*
Post request to get the post data sent from the command line
*/
router.post('/', function(req, res) {
    console.log("req: " + req.body);
    console.log("reponame:" + req.body.reponame);
    var fullDirectory = req.body.repo;

    // Create the project directory under import folder
    folderFuncs.makeDir('./import/' + req.body.reponame + '/');
    // Copy the uploaded folder structure to the import/<projectName> folder
    folderFuncs.copyFolderTree(fullDirectory, './import/' + req.body.reponame + '/');
    res.redirect('localhost:3000');
});


module.exports = router;