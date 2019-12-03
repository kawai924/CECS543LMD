const { ROOTPATH, DATABASE_NAME, USERS_FILENAME, DB_PATH } = require(".");
const fsExt = require("fs-extra");
const path = require("path");
const { ProjectHandler } = require("./ProjectHandler");
const { MasterManReader, MasterManWriter } = require("./Master");

let manifestID;
const user1 = "alice";
const aProj1 = "alpha"; // Grab from project folder.
const aProj2 = "beta"; // Grab from project folder.
const aPH = new ProjectHandler(user1).forProject(aProj1);
const aPH2 = new ProjectHandler(user1).forProject(aProj2);
const aProPath = aPH.projectPath;
const aMasManReader = new MasterManReader(user1, aProj1);
const aMasManWriter = new MasterManWriter(user1, aProj1);

const user2 = "bob";
const bProj1 = aProj1;
const bPH = new ProjectHandler(user2).forProject(bProj1);
const bProPath = bPH.projectPath;

reset();

// Alice
aPH.create(); // manifest_1
alice4CheckIn(); // Alice checks in 4 times

// Bob
manifestID = aMasManReader.getHead();
bPH.checkout(user1, aProj1, manifestID);
bob3CheckIn();

// Alice
alice3CheckIn(); // Alice check in
aliceProject2(); // Alice make new project

/****** Helper functions
 * *********************************/
function alice4CheckIn() {
  // Create ./data.txt
  fsExt.writeFileSync(path.join(aProPath, "data.txt"), "Hello World");
  aPH.checkin();

  // Check in ./foo/test1.txt
  fsExt.mkdirpSync(path.join(aProPath, "foo"));
  fsExt.writeFileSync(path.join(aProPath, "foo", "test1.txt"), "I'm under foo");
  aPH.checkin();

  // Label the manifest above as label_1
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, "label_1");

  // Check in ./bar/baz/test2.txt
  fsExt.mkdirpSync(path.join(aProPath, "bar", "baz"), {
    recursive: true
  });
  fsExt.writeFileSync(
    path.join(aProPath, "bar", "baz", "test2.txt"),
    "I'm under bar/baz"
  );
  aPH.checkin();

  // Change and check in ./foo/test1.txt
  fsExt.mkdirpSync(path.join(aProPath, "foo"));
  fsExt.writeFileSync(
    path.join(aProPath, "foo", "test1.txt"),
    "I just changed..."
  );
  aPH.checkin();

  // Label manifefst above as label_2
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, "label_2");
}

function alice3CheckIn() {
  // Check in ./alice_folder
  fsExt.mkdirpSync(path.join(aProPath, "alice_folder"));
  fsExt.writeFileSync(
    path.join(aProPath, "alice_folder", "alice_file1.txt"),
    "Alice is happy"
  );
  aPH.checkin();

  // label the manifest above as label_3
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, "label_3");

  // Replace ./data.txt content and check in
  fsExt.writeFileSync(path.join(aProPath, "data.txt"), "Alice writes data.txt");
  aPH.checkin();

  // Check in ./alice_secret/alice_journal.txt
  fsExt.mkdirpSync(path.join(aProPath, "alice_secret"), {
    recursive: true
  });
  fsExt.writeFileSync(
    path.join(aProPath, "alice_secret", "alice_journal.txt"),
    "Don't read me"
  );
  aPH.checkin();
}

function aliceProject2() {
  aPH2.create();
  aPH2.checkin();
  aPH2.checkin();
}

function bob3CheckIn() {
  // Check in ./bob_folder/run.txt
  fsExt.mkdirpSync(path.join(bProPath, "bob_folder"));
  fsExt.writeFileSync(
    path.join(bProPath, "bob_folder", "run.txt"),
    "Bob is running"
  );
  bPH.checkin();

  // Check in ./bob_folder/walk.txt
  fsExt.writeFileSync(
    path.join(bProPath, "bob_folder", "walk.txt"),
    "Bob is tired, walking"
  );
  bPH.checkin();

  // Replace ./data.txt with new content and check in.
  fsExt.writeFileSync(
    path.join(bProPath, "data.txt"),
    "Bob overwrites file..."
  );
  bPH.checkin();
}

/**
 * Reset alice and bob
 */
function reset() {
  fsExt.removeSync(path.join(DB_PATH, user1));
  fsExt.removeSync(path.join(DB_PATH, user2));
  fsExt.removeSync(path.join(ROOTPATH, DATABASE_NAME, USERS_FILENAME));
}
