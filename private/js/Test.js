const { path, fsExt, ROOTPATH, DATABASE_NAME, USERS_FILENAME } = require("./");
const RepoHandler = require("./RepoHandler");
const PathHandler = require("./PathHandler");

let manifestID;
const user1 = "alice";
const repo1 = "ProjectX"; // Grab from project folder.
const alicePathHandler = PathHandler(user1, repo1);

const user2 = "bob";
const repo2 = "ProjectX";
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

/****** Helper functions
 * *********************************/
function alice4CheckIn() {
  fsExt.writeFileSync(
    path.join(alicePathHandler.getProjectPath(), "data.txt"),
    "Hello World"
  );
  repoHandler1.checkin();

  fsExt.mkdirpSync(path.join(alicePathHandler.getProjectPath(), "foo"));
  fsExt.writeFileSync(
    path.join(alicePathHandler.getProjectPath(), "foo", "test1.txt"),
    "I'm under foo"
  );
  repoHandler1.checkin();
  manifestID = repoHandler1.getHeadManifestID();
  repoHandler1.addLabel(manifestID, "label_1");

  fsExt.mkdirpSync(path.join(alicePathHandler.getProjectPath(), "bar", "baz"), {
    recursive: true
  });
  fsExt.writeFileSync(
    path.join(alicePathHandler.getProjectPath(), "bar", "baz", "test2.txt"),
    "I'm under bar/baz"
  );
  repoHandler1.checkin();

  fsExt.mkdirpSync(path.join(alicePathHandler.getProjectPath(), "foo"));
  fsExt.writeFileSync(
    path.join(alicePathHandler.getProjectPath(), "foo", "test1.txt"),
    "I just changed..."
  );
  repoHandler1.checkin();
  manifestID = repoHandler1.getHeadManifestID();
  repoHandler1.addLabel(manifestID, "label_2");
}

function alice3CheckIn() {
  fsExt.mkdirpSync(
    path.join(alicePathHandler.getProjectPath(), "alice_folder")
  );
  fsExt.writeFileSync(
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

  fsExt.writeFileSync(
    path.join(alicePathHandler.getProjectPath(), "data.txt"),
    "Alice writes data.txt"
  );
  repoHandler1.checkin();

  fsExt.mkdirpSync(
    path.join(alicePathHandler.getProjectPath(), "alice_secret"),
    {
      recursive: true
    }
  );
  fsExt.writeFileSync(
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
  fsExt.mkdirpSync(path.join(bobPathHandler.getProjectPath(), "bob_folder"));
  fsExt.writeFileSync(
    path.join(bobPathHandler.getProjectPath(), "bob_folder", "run.txt"),
    "Bob is running"
  );
  repoHandler2.checkin();

  fsExt.writeFileSync(
    path.join(bobPathHandler.getProjectPath(), "bob_folder", "walk.txt"),
    "Bob is tired, walking"
  );
  repoHandler2.checkin();

  fsExt.writeFileSync(
    path.join(bobPathHandler.getProjectPath(), "data.txt"),
    "Bob overwrites file..."
  );
  repoHandler2.checkin();
}

function reset() {
  fsExt.removeSync(path.join(alicePathHandler.getProjectPath()));
  fsExt.removeSync(path.join(bobPathHandler.getProjectPath()));
  fsExt.removeSync(path.join(ROOTPATH, DATABASE_NAME, USERS_FILENAME));
}

// const headManifestID = repoHandler.getHeadManifestID();
// repoHandler.addLabel(headManifestID, "my_label");
