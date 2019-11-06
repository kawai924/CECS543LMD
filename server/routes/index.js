const express = require('express');
const path = require('path');

const router = express.Router();

const constants = require('../constants.js');
const RepoHandler = require('../../private/js/RepoHandler');

// GET homepage
router.get('/', function(req, res, next) {
  return res.sendFile(path.join(constants.APPPATH, 'index.html'));
});

// POST form in homepage
router.post('/', function(req, res) {
  const userName = req.body.username;
  res.redirect('/user?username=' + userName);
});

module.exports = router;
