const express = require('express');
const path = require('path');
const fs = require('fs');
const constants = require('../constants.js');
const RepoHandler = require('../../private/js/RepoHandler');

const router = express.Router();

router.get('/:username', function(req, res, next) {
  const userName = req.params.username;
  const userPath = path.join(constants.ROOTPATH, 'database', userName);

  // Brand new user, make a folder
  if (!fs.existsSync(userPath)) {
    fs.mkdirSync(userPath, { recursive: true });
  }

  const repoList = fs.readdirSync(userPath); // Grab all the repo of user from database
  const repoInfoList = buildRepoInfoList(repoList, userPath);
  // console.log(userPath);
  res.render('user', { userName, repoInfoList });
  // return res.sendFile(path.join(constants.APPPATH, 'home.html'));
});

router.post('/:username', function(req, res, next) {
  // Grab and deconstruct information from request
  const { command_option, repoName, label, manifestID } = req.body;
  const userName = req.params.username;

  // Check if sourcePath or destPath are provided. If not, use default
  const sourcePath =
    req.body.sourcePath === ''
      ? path.join(constants.ROOTPATH, 'testing')
      : req.body.sourcePath;
  const destPath =
    req.body.destPath === ''
      ? path.join(constants.ROOTPATH, 'testing', 'dest')
      : req.body.destPath;

  // console.log({
  //   command_option,
  //   repoName,
  //   sourcePath,
  //   label,
  //   userName,
  //   destPath
  // });

  const repoHandler = new RepoHandler(userName, repoName, { sourcePath });
  switch (command_option) {
    case 'create':
      repoHandler.create();
      break;
    case 'check-out':
      const id = manifestID || label;
      repoHandler.checkout(id, destPath);
      break;
    // case 'check-in':
    case 'label':
      repoHandler.addLabel(manifestID, label);
      break;
    default:
      console.log('Unknown command!!!!');
  }

  // /* Testing create repo */
  // const repoHandler = new RepoHandler(userName, repoName, { sourcePath });
  // repoHandler.create();
  /* Testing labeling */
  // const repoHandler = new RepoHandler(userName, repoName);
  // repoHandler.addLabel('1', 'label1');
  // repoHandler.addLabel('3', 'label2');
  // repoHandler.addLabel('4', 'label3');
  // repoHandler.addLabel('7', 'label4');
  /* Testing checkout */
  // const repoHandler = new RepoHandler(userName, repoName);
  // const destPath = path.join(constants.ROOTPATH, 'testing', 'dest');
  // repoHandler.checkout("1", destPath);
  // repoHandler.checkout('label1', destPath);
  /* Testing check-in */
  // const repoHandler = new RepoHandler(userName, repoName, "check-in");
  res.redirect('/user/' + userName);
});

// Helper functions
function buildRepoInfoList(repoList, userPath) {
  const repoInfoList = [];

  // Build repoInfo for each repo
  repoList.forEach(repo => {
    // Check if it is a REPO
    if (fs.lstatSync(path.join(userPath, repo)).isDirectory()) {
      // Initialize
      const repoInfoEach = { name: repo, manifests: [], labels: [] };
      const manifestFolderPath = path.join(userPath, repo, 'manifests');

      // Grab list of manifests
      const manifestList = fs.readdirSync(manifestFolderPath);

      // Grab labels from master manifest
      repoInfoEach.labels = JSON.parse(
        fs.readFileSync(path.join(userPath, repo, 'master_manifest.json'))
      ).labels;

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
    }
  });

  return repoInfoList;
}

module.exports = router;
