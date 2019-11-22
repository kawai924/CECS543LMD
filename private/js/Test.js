const RepoHandler = require("./RepoHandler");
const InfoHandler = require("./InfoHandler");

const fs = require("fs-extra");
const path = require("path");
const ROOTPATH = path.join(__dirname, "..", "..");

const user1 = "Alice";
const repo1 = "ProjectX"; // Grab from project folder.
const projectPath1 = path.join(ROOTPATH, "database", user1, repo1); // This should be the path to the project

const user2 = "Bob";
const repo2 = "ProjectX";
const projectPath2 = path.join(ROOTPATH, "database", "Bob", "ProjectX");

reset();

const repoHandler1 = new RepoHandler(user1, repo1, projectPath1);
repoHandler1.create(); // manifest_1

// Alice checks in 4 times
alice4CheckIn();

// Bob check out
const manifestID = repoHandler1.getHeadManifestID();
const repoHandler2 = new RepoHandler(user2, repo2, projectPath2);
repoHandler2.checkout(projectPath1, manifestID);
bob3CheckIn();

// Alice check in
alice3CheckIn();

// Helper functions
function alice4CheckIn() {
  fs.writeFileSync(path.join(projectPath1, "data.txt"), "Hello World");
  repoHandler1.checkin();

  fs.mkdirpSync(path.join(projectPath1, "foo"));
  fs.writeFileSync(
    path.join(projectPath1, "foo", "test1.txt"),
    "I'm under foo"
  );
  repoHandler1.checkin();

  fs.mkdirpSync(path.join(projectPath1, "bar", "baz"), { recursive: true });
  fs.writeFileSync(
    path.join(projectPath1, "bar", "baz", "test2.txt"),
    "I'm under bar/baz"
  );
  repoHandler1.checkin();

  fs.mkdirpSync(path.join(projectPath1, "foo"));
  fs.writeFileSync(
    path.join(projectPath1, "foo", "test1.txt"),
    "I just changed..."
  );
  repoHandler1.checkin();
}

function alice3CheckIn() {
  fs.mkdirpSync(path.join(projectPath1, "alice_folder"));
  fs.writeFileSync(
    path.join(projectPath1, "alice_folder", "alice_file1.txt"),
    "Alice is happy"
  );
  repoHandler1.checkin();

  fs.writeFileSync(
    path.join(projectPath1, "data.txt"),
    "Alice writes data.txt"
  );
  repoHandler1.checkin();

  fs.mkdirpSync(path.join(projectPath1, "alice_secret"), { recursive: true });
  fs.writeFileSync(
    path.join(projectPath1, "alice_secret", "alice_journal.txt"),
    "Don't read me"
  );
  repoHandler1.checkin();
}

function bob3CheckIn() {
  fs.mkdirpSync(path.join(projectPath2, "bob_folder"));
  fs.writeFileSync(
    path.join(projectPath2, "bob_folder", "run.txt"),
    "Bob is running"
  );
  repoHandler2.checkin();

  fs.writeFileSync(
    path.join(projectPath2, "bob_folder", "walk.txt"),
    "Bob is tired, walking"
  );
  repoHandler2.checkin();

  fs.writeFileSync(
    path.join(projectPath2, "data.txt"),
    "Bob overwrites file..."
  );
  repoHandler2.checkin();
}

function reset() {
  fs.removeSync(path.join(projectPath1));
  fs.removeSync(path.join(projectPath2));
}

// const headManifestID = repoHandler.getHeadManifestID();
// repoHandler.addLabel(headManifestID, "my_label");
