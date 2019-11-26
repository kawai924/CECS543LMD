const fs = require("fs-extra");
const path = require("path");

const RepoHandler = require("./RepoHandler");
const PathHandler = require("./PathHandler");
const {
  ROOTPATH,
  DATABASE_NAME,
  USERS_FILENAME
} = require("./../../constants");

let manifestID;
const user1 = "Alice";
const repo1 = "ProjectX"; // Grab from project folder.
// const alicePathHandler.getProjectPath() = path.join(ROOTPATH, "database", user1, repo1); // This should be the path to the project
const alicePathHandler = PathHandler(user1, repo1);

const user2 = "Bob";
const repo2 = "ProjectX";
// // const bobPathHandler.getProjectPath() = path.join(ROOTPATH, "database", "Bob", "ProjectX");
const bobPathHandler = PathHandler(user2, repo2);

reset();

const repoHandler1 = new RepoHandler(
  user1,
  repo1,
  alicePathHandler.getProjectPath()
);
repoHandler1.create(); // manifest_1

// Alice checks in 4 times
alice4CheckIn();

// Bob check out
manifestID = repoHandler1.getHeadManifestID();
const repoHandler2 = new RepoHandler(
  user2,
  repo2,
  bobPathHandler.getProjectPath()
);
repoHandler2.checkout(user1, repo1, manifestID);
bob3CheckIn();

// Alice check in
alice3CheckIn();


// Create object to pass to getParentList
// Or we can just pass in the repoHandlers
alicePathObject = {
  path: alicePathHandler.getProjectPath(),
  manifestID: repoHandler1.getHeadManifestID()
};
bobPathObject = {
  path: bobPathHandler.getProjectPath(),
  manifestID: repoHandler2.getHeadManifestID()
};
// Parent list testing
let bobParentList = repoHandler1.getParentList( bobPathObject );
let aliceParentList = repoHandler2.getParentList(alicePathObject);
console.log(bobParentList, aliceParentList);

console.log(repoHandler1.commonAncestor(bobParentList, aliceParentList));

/****** Helper functions
 * *********************************/
function alice4CheckIn() {
  fs.writeFileSync(
    path.join(alicePathHandler.getProjectPath(), "data.txt"),
    "Hello World"
  );
  repoHandler1.checkin();

  fs.mkdirpSync(path.join(alicePathHandler.getProjectPath(), "foo"));
  fs.writeFileSync(
    path.join(alicePathHandler.getProjectPath(), "foo", "test1.txt"),
    "I'm under foo"
  );
  repoHandler1.checkin();
  manifestID = repoHandler1.getHeadManifestID();
  repoHandler1.addLabel(manifestID, "label_1");

  fs.mkdirpSync(path.join(alicePathHandler.getProjectPath(), "bar", "baz"), {
    recursive: true
  });
  fs.writeFileSync(
    path.join(alicePathHandler.getProjectPath(), "bar", "baz", "test2.txt"),
    "I'm under bar/baz"
  );
  repoHandler1.checkin();

  fs.mkdirpSync(path.join(alicePathHandler.getProjectPath(), "foo"));
  fs.writeFileSync(
    path.join(alicePathHandler.getProjectPath(), "foo", "test1.txt"),
    "I just changed..."
  );
  repoHandler1.checkin();
  manifestID = repoHandler1.getHeadManifestID();
  repoHandler1.addLabel(manifestID, "label_2");
}

function alice3CheckIn() {
  fs.mkdirpSync(path.join(alicePathHandler.getProjectPath(), "alice_folder"));
  fs.writeFileSync(
    path.join(
      alicePathHandler.getProjectPath(),
      "alice_folder",
      "alice_file1.txt"
    ),
    "Alice is happy"
  );
  repoHandler1.checkin();
  manifestID = repoHandler1.getHeadManifestID();
  repoHandler1.addLabel(manifestID, "label_3");

  fs.writeFileSync(
    path.join(alicePathHandler.getProjectPath(), "data.txt"),
    "Alice writes data.txt"
  );
  repoHandler1.checkin();

  fs.mkdirpSync(path.join(alicePathHandler.getProjectPath(), "alice_secret"), {
    recursive: true
  });
  fs.writeFileSync(
    path.join(
      alicePathHandler.getProjectPath(),
      "alice_secret",
      "alice_journal.txt"
    ),
    "Don't read me"
  );
  repoHandler1.checkin();
}

function bob3CheckIn() {
  fs.mkdirpSync(path.join(bobPathHandler.getProjectPath(), "bob_folder"));
  fs.writeFileSync(
    path.join(bobPathHandler.getProjectPath(), "bob_folder", "run.txt"),
    "Bob is running"
  );
  repoHandler2.checkin();

  fs.writeFileSync(
    path.join(bobPathHandler.getProjectPath(), "bob_folder", "walk.txt"),
    "Bob is tired, walking"
  );
  repoHandler2.checkin();

  fs.writeFileSync(
    path.join(bobPathHandler.getProjectPath(), "data.txt"),
    "Bob overwrites file..."
  );
  repoHandler2.checkin();
}

function reset() {
  fs.removeSync(path.join(alicePathHandler.getProjectPath()));
  fs.removeSync(path.join(bobPathHandler.getProjectPath()));
  fs.removeSync(path.join(ROOTPATH, DATABASE_NAME, USERS_FILENAME));
}

// const headManifestID = repoHandler.getHeadManifestID();
// repoHandler.addLabel(headManifestID, "my_label");
