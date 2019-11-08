const express = require('express');
const path = require('path');
const fs = require('fs');

const RepoHandler = require('../../private/js/RepoHandler');
const ROOTPATH = path.join(__dirname, '..', '..');

const router = express.Router();

router.get('/:username', function(req, res, next) {
  // Grab data from request
  const userName = req.params.username;
  const userPath = path.join(ROOTPATH, 'database', userName);

  // If it's a new user, create a folder in database
  if (!fs.existsSync(userPath)) {
    fs.mkdirSync(userPath, { recursive: true });
  }

  // Grab all the repo of user from database
  const repoList = fs.readdirSync(userPath);
  // Gather information for each repo
  const repoInfoList = buildRepoInfoList(repoList, userPath);

  res.render('user', { userName, repoInfoList });
});

router.post('/:username', function(req, res, next) {
  // Grab information from request
  const {
    command_option,
    repoName,
    label,
    manifestID,
    sourcePath,
    destPath
  } = req.body;
  const userName = req.params.username;
  let id;
  console.log('sourcePath = ' + sourcePath);
  // Create a repo handler to handle commands
  const repoHandler = new RepoHandler(userName, repoName, { sourcePath });
  switch (command_option) {
    case 'create':
      repoHandler.create();
      break;
    case 'check-out':
      id = manifestID || label;
      repoHandler.checkout(id, destPath);
      break;
    case 'check-in':
      id = manifestID || label;
      repoHandler.checkin(sourcePath);
      break;
    case 'label':
      repoHandler.addLabel(manifestID, label);
      break;
    default:
      console.log('Unknown command...');
  }

  res.redirect('/user/' + userName);
});

/* Helper functions */
/* Gather information about repos in database of a user */
function buildRepoInfoList(repoList, userPath) {
  const repoInfoList = [];

  // Build an object containing information for each repo
  repoList.forEach(repo => {
    // Check if it is a directory
    if (fs.lstatSync(path.join(userPath, repo)).isDirectory()) {
      // Initialize
      const repoInfoEach = {
        name: repo,
        manifests: [],
        labels: [],
        filepath: []
      };
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

        let list = '';
        for (i in manifestObject.structure) {
          let elem = manifestObject.structure[i];
          const elemarr = [];
          for (let key in elem) {
            elemarr.push(key);
          }
          let LIFO = elemarr.pop();
          list += elem[LIFO];
          LIFO = elemarr.pop();
          list += elem[LIFO] + '\n';
        }

        let readdatetime = manifestObject.datetime
          .replace(/T/, ' ')
          .replace(/\..+/, '');
        repoInfoEach.manifests.push({
          name: manifest,
          command: manifestObject.command,
          datetime: readdatetime,
          filepath: list,
          ID: manifestObject.id
        });
      });

      repoInfoList.push(repoInfoEach);
    }
  });
  return repoInfoList;
}

module.exports = router;
