const express = require('express');
const path = require('path');
const constants = require('../constants.js');
const fs = require('fs');

const router = express.Router();

router.get('/', function(req, res, next) {
  const userName = 'liam';
  const repoList = getRepo(path.join(constants.ROOTPATH, 'database', userName));
  res.render('testing', { repoList });
});

// For Testing purpose
function getRepo(dir) {
  return fs.readdirSync(dir);
}

module.exports = router;
