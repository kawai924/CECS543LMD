/********** IMPORT MODULES **********/
const express = require("express");
const {
  View,
  ViewAll,
  ViewOneUser,
  ViewOneUserOneProj
} = require("../../private/js/View");
const { ROOTPATH, DATABASE_NAME, DB_PATH } = require("../../private/js/");
const path = require("path");
const fs = require("fs");
const Parser = require("./../../private/js/Parser");
/****************************************/

const router = express.Router();

router.get("/:username", function(req, res, next) {
  // Grab data from request
  const username = req.params.username;
  const userPath = path.join(DB_PATH, username);

  // If it's a new user, create a folder in database
  if (!fs.existsSync(userPath)) {
    fs.mkdirSync(userPath, { recursive: true });
  }

  const projList = new ViewOneUser(username).execute().projects;
  console.log({ projList: JSON.stringify(projList) });
  res.render("user", {
    username,
    projList
  });
});

router.post("/:username", function(req, res, next) {
  const { commandInput } = req.body;
  const username = req.params.username;
  Parser().commandParse(username, commandInput);

  // // Grab information from request
  // const {
  //   command_option,
  //   repoName,
  //   label,
  //   manifestID,
  //   sourcePath,
  //   destPath
  // } = req.body;
  // let id;

  // // Create a repo handler to handle commands
  // const repoHandler = new RepoHandler(username, repoName, { sourcePath });
  // switch (command_option) {
  //   case "create":
  //     repoHandler.create();
  //     break;
  //   case "check-out":
  //     id = manifestID || label;
  //     repoHandler.checkout(id, destPath);
  //     break;
  //   case "check-in":
  //     id = manifestID || label;
  //     repoHandler.checkin(sourcePath);
  //     break;
  //   case "label":
  //     repoHandler.addLabel(manifestID, label);
  //     break;
  //   default:
  //     console.log("Unknown command...");
  // }

  res.redirect("/user/" + username);
});

module.exports = router;
