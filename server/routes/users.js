/*
 * Route for all users page
 * Authors: Liam Nguyen | Matt Nguyen | Marco Curci | Dennis Lo
 * Contacts: nguyen.dch@gmail.com | matthewnguyen19@gmail.com | marco.curci@student.csulb.edu | dennis.lo@student.csulb.edu
 * LMD VSC Control - CECS 543 - Fall 2019
 */

const express = require('express');
const { ViewAll } = require('../../private/js/View');

const router = express.Router();

router.get('/', function(req, res, next) {
  const username = req.query.username;

  const users = new ViewAll().execute();
  return res.render('users', { users, username });
});

module.exports = router;
