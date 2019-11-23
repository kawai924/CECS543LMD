const express = require("express");
const DBHandler = require("./../../private/js/DBHandler");

const router = express.Router();

router.get("/", function(req, res, next) {
  return res.render("index", { users: DBHandler().getUsers() });
});

router.post("/", function(req, res) {
  const userName = req.body.username === "" ? "johndoe" : req.body.username;

  // Add user into users.json
  DBHandler().addUser(userName);

  res.redirect("/user/" + userName);
});

module.exports = router;
