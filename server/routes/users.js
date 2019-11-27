const express = require("express");
const path = require("path");
const fs = require("fs");
const { ViewAll } = require("../../private/js/View");
const { DB_PATH } = require("../../private/js");

const router = express.Router();

router.get("/", function(req, res, next) {
  const username = req.query.username;

  const users = new ViewAll().execute();
  return res.render("users", { users, username });
});

module.exports = router;
