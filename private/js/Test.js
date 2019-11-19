const RepoHandler = require("./RepoHandler");
const InfoHandler = require("./InfoHandler");

const fs = require("fs-extra");
const path = require("path");
const ROOTPATH = path.join(__dirname, "..", "..");

const username = "Alice";
const repoName = "ProjectX"; // Grab from project folder.
const projectPath = path.join(ROOTPATH, "database", "ProjectX"); // This should be the path to the project

// fs.removeSync(path.join(projectPath));

const repoHandler = new RepoHandler(username, repoName, projectPath);
// repoHandler.create();
repoHandler.checkin();

// const infoHandler = new InfoHandler(
//   username,
//   repoName,
//   path.join(projectPath, "manifests")
// // );
// infoHandler.write();
// infoHandler.addLabel(123131414, "first_label");
// infoHandler.addManifest(
//   123131414,
//   path.join(projectPath, "manifests", "m1.json")
// );
