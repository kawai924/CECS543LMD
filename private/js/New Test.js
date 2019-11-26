const { ROOTPATH, DATABASE_NAME, USERS_FILENAME } = require("./");
const fsExt = require("fs-extra");
const path = require("path");
const { ProjectHandler } = require("./ProjectHandler");
const { MasterManReader, MasterManWriter } = require("./Master");

let manifestID;
const user1 = "alice";
const proj1 = "ProjectX"; // Grab from project folder.
const aPH = new ProjectHandler(user1).forProject(proj1);
const aProPath = aPH.projectPath;
const aMasManReader = new MasterManReader(user1, proj1);
const aMasManWriter = new MasterManWriter(user1, proj1);

const user2 = "bob";
const proj2 = "ProjectX";
const bPH = new ProjectHandler(user2).forProject(proj2);
const bProPath = bPH.projectPath;

reset();

aPH.create(); // manifest_1

// Alice checks in 4 times
alice4CheckIn();

// Bob check out
manifestID = aMasManReader.getHead();
bPH.checkout(user1, proj1, manifestID);
bob3CheckIn();

// Alice check in
alice3CheckIn();

/****** Helper functions
 * *********************************/
function alice4CheckIn() {
  fsExt.writeFileSync(path.join(aProPath, "data.txt"), "Hello World");
  aPH.checkin();

  fsExt.mkdirpSync(path.join(aProPath, "foo"));
  fsExt.writeFileSync(path.join(aProPath, "foo", "test1.txt"), "I'm under foo");
  aPH.checkin();
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, "label_1");

  fsExt.mkdirpSync(path.join(aProPath, "bar", "baz"), {
    recursive: true
  });
  fsExt.writeFileSync(
    path.join(aProPath, "bar", "baz", "test2.txt"),
    "I'm under bar/baz"
  );
  aPH.checkin();

  fsExt.mkdirpSync(path.join(aProPath, "foo"));
  fsExt.writeFileSync(
    path.join(aProPath, "foo", "test1.txt"),
    "I just changed..."
  );
  aPH.checkin();
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, "label_2");
}

function alice3CheckIn() {
  fsExt.mkdirpSync(path.join(aProPath, "alice_folder"));
  fsExt.writeFileSync(
    path.join(aProPath, "alice_folder", "alice_file1.txt"),
    "Alice is happy"
  );
  aPH.checkin();
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, "label_3");

  fsExt.writeFileSync(path.join(aProPath, "data.txt"), "Alice writes data.txt");
  aPH.checkin();

  fsExt.mkdirpSync(path.join(aProPath, "alice_secret"), {
    recursive: true
  });
  fsExt.writeFileSync(
    path.join(aProPath, "alice_secret", "alice_journal.txt"),
    "Don't read me"
  );
  aPH.checkin();
}

function bob3CheckIn() {
  fsExt.mkdirpSync(path.join(bProPath, "bob_folder"));
  fsExt.writeFileSync(
    path.join(bProPath, "bob_folder", "run.txt"),
    "Bob is running"
  );
  bPH.checkin();

  fsExt.writeFileSync(
    path.join(bProPath, "bob_folder", "walk.txt"),
    "Bob is tired, walking"
  );
  bPH.checkin();

  fsExt.writeFileSync(
    path.join(bProPath, "data.txt"),
    "Bob overwrites file..."
  );
  bPH.checkin();
}

function reset() {
  fsExt.removeSync(path.join(aProPath));
  fsExt.removeSync(path.join(bProPath));
  fsExt.removeSync(path.join(ROOTPATH, DATABASE_NAME, USERS_FILENAME));
}

// const headManifestID = repoHandler.getHeadManifestID();
// repoHandler.addLabel(headManifestID, "my_label");
