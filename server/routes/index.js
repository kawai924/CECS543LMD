const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const folderFuncs = require("../../private/js/FolderFunctions");
const constants = require("../constants.js");
const RepoHandler = require("../../private/js/RepoHandler");

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

// GET homepage
router.get("/", function(req, res, next) {
  return res.sendFile(path.join(constants.APPPATH, "index.html"));
});

// POST form in homepage
router.post("/", function(req, res) {
  const userName = req.body.username; // get username
  const repoName = req.body.repoName; // get repo name

  /* Testing create repo */
  const repoHandler = new RepoHandler(userName, repoName);
  repoHandler.create();

  /* Testing labeling */
  // const repoHandler = new RepoHandler(userName, repoName);
  repoHandler.addLabel("1", "label1");
  repoHandler.addLabel("3", "label2");
  repoHandler.addLabel("4", "label3");
  repoHandler.addLabel("7", "label4");

  /* Testing checkout */
  // const repoHandler = new RepoHandler(userName, repoName);
  const destPath = path.join(constants.ROOTPATH, "testing", "dest");
  // repoHandler.checkout("1", destPath);
  repoHandler.checkout("label1", destPath);

  /* Testing check-in */
  // const repoHandler = new RepoHandler(userName, repoName, "check-in");

  /* Old Way
  // // Create the project directory under database folder and manifests folder under the project folder
  // folderFuncs.makeDir(destPath, { recursive: true });
  // folderFuncs.makeDir(path.join(destPath, "manifests"), { recursive: true });

  // let manifestObject = new Manifest("create repo", destPath);
  // manifestObject.init();
  // // Copy the uploaded folder structure to the data/<projectName> folder
  // folderFuncs.copyFolderTree(sourcePath, destPath, manifestObject);
  // manifestObject.complete();
  */

  res.redirect("localhost:3000/");
});

module.exports = router;
