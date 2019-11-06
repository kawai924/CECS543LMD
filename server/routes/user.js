const express = require('express');
const path = require('path');
const constants = require('../constants.js');
const fs = require('fs');

const router = express.Router();

router.get('/', function(req, res, next) {
  const userName = req.query.username;

  const repoList = fs.readdirSync(
    path.join(constants.ROOTPATH, 'database', userName)
  );
  res.render('user', { repoList });
  // return res.sendFile(path.join(constants.APPPATH, 'home.html'));
});

module.exports = router;
