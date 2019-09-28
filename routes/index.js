var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var ft = require('../helpers/folderTree');
var path = require('path');


/*
Parse incoming request.
 */
router.use(bodyParser());

/*
Display index.html as home-page
 */
router.get('/', function(req, res, next) {
    var path = 'index.html';
    var options = {
        root : './public/app/'
    };
    res.sendFile(path, options, function(err){
        console.log(err)
    });
});

/*
Post request to get the post data sent from the command line
*/
router.post('/', function(req, res) {
    console.log("req: " + req.body);
    console.log("reponame:" + req.body.reponame);
    var fullDirectory = req.body.repo;
    
    // Create the project directory under import folder
    ft.makeDir('./import/' + req.body.reponame + '/');
    // Copy the uploaded folder structure to the import/<projectName> folder
    ft.copyFolderTree(fullDirectory, './import/' + req.body.reponame + '/');
    res.redirect('localhost:3000');
});


module.exports = router;