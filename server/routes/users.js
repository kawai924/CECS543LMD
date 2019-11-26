const express = require("express");
const { ViewAll } = require("../../private/js/View");

const router = express.Router();

router.get("/", function(req, res, next) {
  const username = req.query.username;

  const users = new ViewAll().execute();
  console.log(users[0].projects.projects);
  return res.render("users", { users, username });
});

module.exports = router;
