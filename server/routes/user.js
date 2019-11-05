const express = require('express');
const path = require('path');
const constants = require('../constants.js');

const router = express.Router();

router.get('/', function(req, res, next) {
  console.log(req.params['username-login']);
  return res.sendFile(path.join(constants.APPPATH, 'home.html'));
});

module.exports = router;
