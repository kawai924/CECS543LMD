/*
 * Route for homepage
 * Authors: Liam Nguyen | Matt Nguyen | Marco Curci | Dennis Lo
 * Contacts: nguyen.dch@gmail.com | matthewnguyen19@gmail.com | marco.curci@student.csulb.edu | dennis.lo@student.csulb.edu
 * LMD VSC Control - CECS 543 - Fall 2019
 */

const express = require('express');

const router = express.Router();

router.get('/', function(req, res, next) {
  return res.render('index');
});

router.post('/', function(req, res) {
  const username = req.body.username.toLowerCase();
  res.redirect('/user/' + username);
});

module.exports = router;
