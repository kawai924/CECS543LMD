const express = require('express');
const path = require('path');
const constants = require('../constants.js');
const fs = require('fs');

const router = express.Router();

router.get('/', function(req, res, next) {
  const userName = req.query.username;
  const userPath = path.join(constants.ROOTPATH, 'database', userName);

  // Grab all the repo in user folder
  const repoList = fs.readdirSync(userPath);
  const repoInfoList = buildRepoInfoList(repoList, userPath);
  res.render('user', { repoInfoList });
  // return res.sendFile(path.join(constants.APPPATH, 'home.html'));
});

router.post('/', function(req, res, next) {
  console.log(req);
  // const userName = req.body.username; // get username
  // const repoName = req.body.repoName; // get repo name
  // /* Testing create repo */
  // const repoHandler = new RepoHandler(userName, repoName);
  // repoHandler.create();
  // /* Testing labeling */
  // // const repoHandler = new RepoHandler(userName, repoName);
  // // repoHandler.addLabel('1', 'label1');
  // // repoHandler.addLabel('3', 'label2');
  // // repoHandler.addLabel('4', 'label3');
  // // repoHandler.addLabel('7', 'label4');
  // /* Testing checkout */
  // // const repoHandler = new RepoHandler(userName, repoName);
  // // const destPath = path.join(constants.ROOTPATH, 'testing', 'dest');
  // // repoHandler.checkout("1", destPath);
  // // repoHandler.checkout('label1', destPath);
  // /* Testing check-in */
  // // const repoHandler = new RepoHandler(userName, repoName, "check-in");
  // /* Old Way
  // // // Create the project directory under database folder and manifests folder under the project folder
  // // folderFuncs.makeDir(destPath, { recursive: true });
  // // folderFuncs.makeDir(path.join(destPath, "manifests"), { recursive: true });
  // // let manifestObject = new Manifest("create repo", destPath);
  // // manifestObject.init();
  // // // Copy the uploaded folder structure to the data/<projectName> folder
  // // folderFuncs.copyFolderTree(sourcePath, destPath, manifestObject);
  // // manifestObject.complete();
  // */
  // // const newURL = `localhost:3000/user?userName=${userName}`;
  // res.redirect('localhost:3000/user?username-login=liam');
});

// Helper functions
function buildRepoInfoList(repoList, userPath) {
  const repoInfoList = [];

  // Build repoInfo for each repo
  repoList.forEach(repo => {
    // Initialize
    const repoInfoEach = { name: repo, manifests: [] };
    const manifestFolderPath = path.join(userPath, repo, 'manifests');

    // Grab list of manifests
    const manifestList = fs.readdirSync(manifestFolderPath);

    // For each manifest, build an list of necessary information into an object
    // then push that object into repoInfoEach.manifests array
    manifestList.forEach(manifest => {
      const manifestObject = JSON.parse(
        fs.readFileSync(path.join(manifestFolderPath, manifest))
      );

      repoInfoEach.manifests.push({
        name: manifest,
        command: manifestObject.command,
        datetime: manifestObject.datetime
      });
    });

    repoInfoList.push(repoInfoEach);
  });

  return repoInfoList;
}

module.exports = router;
