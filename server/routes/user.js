/********** IMPORT MODULES **********/
const express = require("express");
const { buildRepoInfoList } = require("../../private/js/Functions");
const { fs, path, ROOTPATH, DATABASE_NAME } = require("../../private/js/");
// const DBHandler = require("../../private/js/DBHandler");
const Parser = require("./../../private/js/Parser");
/****************************************/

const router = express.Router();

router.get("/:username", function(req, res, next) {
  // Grab data from request
  const username = req.params.username;
  const userPath = path.join(ROOTPATH, DATABASE_NAME, username);

  // If it's a new user, create a folder in database
  if (!fs.existsSync(userPath)) {
    fs.mkdirSync(userPath, { recursive: true });
  }

  // Grab all the repo of user from database
  const repoList = fs.readdirSync(userPath);
  // Gather information for each repo
  const repoInfoList = buildRepoInfoList(repoList, userPath);

  res.render("user", {
    username,
    repoInfoList,
    // users: DBHandler().getUsers()
    users: {}
  });
});

router.post("/:username", function(req, res, next) {
  const { commandInput } = req.body;
  const username = req.params.username;
  Parser().commandParse(commandInput, { username });

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
