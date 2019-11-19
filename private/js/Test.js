const RepoHandler = require("./RepoHandler");
const InfoHandler = require("./InfoHandler");

const fs = require("fs-extra");
const path = require("path");
const ROOTPATH = path.join(__dirname, "..", "..");

const username = "liam";
const repoName = "ProjectX"; // Grab from project folder.
const projectPath = path.join(ROOTPATH, "database", "liam", "ProjectX"); // This should be the path to the project

// fs.removeSync(path.join(projectPath));

let repoHandler = new RepoHandler(username, repoName, projectPath);
// repoHandler.create();
// repoHandler.checkin();

const checkout_user = "Bob";
const checkout_repoName = "ProjectX";
const checkout_projectPath = path.join(ROOTPATH, "database", "Bob", "ProjectX");
const manifestID = 1574163428142;

repoHandler = new RepoHandler(
  checkout_user,
  checkout_repoName,
  checkout_projectPath
);
repoHandler.checkout(username, repoName, manifestID);
