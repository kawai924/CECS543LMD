const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  return res.render('index');
});

router.post('/', function(req, res) {
  const userName = req.body.username === '' ? 'johndoe' : req.body.username;
  res.redirect('/user/' + userName);
});

module.exports = router;
