const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const folderFuncs = require('../../private/js/FolderFunctions');
const path = require('path');
const constants = require('../constants.js');


router.use(bodyParser.urlencoded({extended: true}));

//Display index.html as home-page//
router.get('/', function(req, res, next) {
    return res.sendFile(path.join(constants.APPPATH, 'index.html'));
});

//Post request to get the post data sent from the command line
router.post('/', function(req, res) {
    const userName = req.body.username; // get username
    const repoName = req.body.repoName; // get repo name
    const fullDirectory = path.join(constants.TESTPATH, repoName); // absolute repo path
    const importPath = path.join(constants.TESTPATH, 'data', userName, repoName); // absolute data path

    // Create the project directory under data folder
    folderFuncs.makeDir(importPath, {recursive: true});
    // Copy the uploaded folder structure to the data/<projectName> folder
    folderFuncs.copyFolderTree(fullDirectory, importPath);
    res.redirect('localhost:3000');
});


module.exports = router;