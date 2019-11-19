const RepoHandler = require("./RepoHandler");
const InfoHandler = require("./InfoHandler");

const fs = require("fs-extra");
const path = require("path");
const ROOTPATH = path.join(__dirname, "..", "..");

const username = "liam";
const repoName = "ProjectX"; // Grab from project folder.
const projectPath = path.join(ROOTPATH, "database", "liam", "ProjectX"); // This should be the path to the project

fs.removeSync(path.join(projectPath));

let repoHandler = new RepoHandler(username, repoName, projectPath);
repoHandler.create();
repoHandler.checkin();
const headManifestID = repoHandler.getHeadManifestID();
repoHandler.addLabel(headManifestID, "my_label");
writeTestFiles(projectPath);
repoHandler.checkin();

const checkout_user = "Bob";
const checkout_repoName = "ProjectX";
const checkout_projectPath = path.join(ROOTPATH, "database", "Bob", "ProjectX");
const manifestID = repoHandler.getHeadManifestID();

fs.removeSync(path.join(checkout_projectPath));

repoHandler = new RepoHandler(
  checkout_user,
  checkout_repoName,
  checkout_projectPath
);
repoHandler.checkout(projectPath, manifestID);

// Helper functions
function writeTestFiles(toPath) {
  fs.writeFileSync(
    path.join(projectPath, "data.txt"),
    "Hello WorlrepoHandler.checkin();d"
  );

  fs.mkdirpSync(path.join(projectPath, "foo"));
  fs.writeFileSync(path.join(projectPath, "foo", "test1.txt"), "I'm under foo");
  fs.mkdirpSync(path.join(projectPath, "bar", "baz"), { recursive: true });
  fs.writeFileSync(
    path.join(projectPath, "bar", "baz", "test2.txt"),
    "I'm under bar/baz"
  );
}
