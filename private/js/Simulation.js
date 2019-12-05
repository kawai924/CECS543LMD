const fsExt = require("fs-extra");
const fs = require("fs");
const readlineSync = require("readline-sync");
const path = require("path");

const { ROOTPATH, DATABASE_NAME, USERS_FILENAME, DB_PATH } = require(".");
const { ProjectHandler } = require("./ProjectHandler");
const { MasterManReader, MasterManWriter } = require("./Master");
const { ManifestReader } = require("./Manifest");

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
const bMasManReader = new MasterManReader(user2, bProj1);
const bMasManWriter = new MasterManWriter(user2, bProj1);
const bManReader = new ManifestReader(user2, bProj1);

reset();

const simulations = [
  aliceCreate,
  aliceBeforeBobCheckout,
  bobCheckOutAlice,
  bobMergeWithAlice1,
  bobMergeWithAlice2,
  aliceProject2
];

let index = 0;
console.log(
  "-----------------------------------------\nHow to run the simulation?\n 1: Run all\n Enter: Run step by step\n"
);
while (index < simulations.length) {
  let input = readlineSync.question(
    "-----------------------------------------\nYour input: "
  );
  console.log("-----------------------------------------");
  if (input === "1") {
    for (let i = 0; i < simulations.length; i++) {
      simulations[i]();
    }
    break;
  } else {
    simulations[index]();
    index++;
  }
}

/*Helper functions
 ************************/
function aliceCreate() {
  console.log(`ALICE CREATE PROJECT: ${aProj1}`);
  aPH.create();
}
function aliceBeforeBobCheckout() {
  console.log(
    "ALICE CREATES\n FILE: \tdata.txt \n\tCONTENT: 'Alice writes Hello World'"
  );
  fsExt.writeFileSync(
    path.join(aProPath, "data.txt"),
    "Alice writes Hello World"
  );
  aPH.checkin();

  console.log("ALICE CREATES\n FILE: \tfoo/foo1.txt \n\tCONTENT: 'I'm foo'");
  fsExt.mkdirpSync(path.join(aProPath, "foo"));
  fsExt.writeFileSync(path.join(aProPath, "foo", "foo1.txt"), "I'm foo");
  aPH.checkin();

  console.log("ALICE LABEL\n foo");
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, "foo");

  console.log(
    "ALICE CREATES\n FILE: \tbar/baz/baz1.txt \n\tCONTENT: 'I'm under bar/baz'"
  );
  fsExt.mkdirpSync(path.join(aProPath, "bar", "baz"), {
    recursive: true
  });
  fsExt.writeFileSync(
    path.join(aProPath, "bar", "baz", "baz1.txt"),
    "I'm under bar/baz"
  );
  aPH.checkin();

  console.log(
    "ALICE CHANGE\n FILE: \tfoo/foo1.txt \n\tCONTENT: 'Alice said good-bye...'"
  );
  fsExt.mkdirpSync(path.join(aProPath, "foo"));
  fsExt.writeFileSync(
    path.join(aProPath, "foo", "foo1.txt"),
    "Alice said good-bye..."
  );
  aPH.checkin();

  console.log("ALICE LABEL foo_changed");
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, "foo_changed");
}

function bobCheckOutAlice() {
  console.log("BOB CHECKOUT ALICE USING LABEL 'foo'");
  // Bob
  bPH.checkout(user1, aProj1, "foo");

  // Alice
  console.log(
    "BOB CREATES\n FILE: \tnew/alice_status.txt\n\tCONTENT: 'Alice is happy'"
  );
  fsExt.mkdirpSync(path.join(aProPath, "new"));
  fsExt.writeFileSync(
    path.join(aProPath, "new", "alice_status.txt"),
    "Alice is happy"
  );
  aPH.checkin();

  // Alice
  console.log("ALICE LABEL newFolder");
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, "newFolder");

  // Bob
  console.log(
    "BOB CREATES\n FILE: \tnew/bob_status.txt\n\tCONTENT: 'Bob is running'"
  );
  fsExt.mkdirpSync(path.join(bProPath, "new"));
  fsExt.writeFileSync(
    path.join(bProPath, "new", "bob_status.txt"),
    "Bob is running"
  );
  bPH.checkin();

  // Bob
  console.log("BOB LABEL newFolder");
  manifestID = bMasManReader.getHead();
  bMasManWriter.addLabel(manifestID, "newFolder");

  // Alice
  console.log(
    "ALICE CHANGE\n FILE: \tdata.txt \n\tCONTENT: 'Alice comes back'"
  );
  fsExt.writeFileSync(path.join(aProPath, "data.txt"), "Alice comes back");
  aPH.checkin();

  // Alice
  console.log(
    "ALICE CHANGE\n FILE: \tsecret/journal.txt \n\tCONTENT: 'Don't read me'"
  );
  fsExt.mkdirpSync(path.join(aProPath, "secret"), {
    recursive: true
  });
  fsExt.writeFileSync(
    path.join(aProPath, "secret", "journal.txt"),
    "Don't read me"
  );
  aPH.checkin();

  // Alice
  console.log("ALICE LABEL journal");
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, "journal");

  // Bob overwrites data.txt
  console.log(
    "BOB CHANGE\n FILE: \tdata.txt \n\tCONTENT: 'Bob just swings by...'"
  );
  fsExt.writeFileSync(path.join(bProPath, "data.txt"), "Bob just swings by...");
  bPH.checkin();

  // Bob overwrites foo1.txt
  console.log(
    "BOB CHANGE\n FILE: \tfoo/foo1.txt \n\tCONTENT: 'Bob changed foo....'"
  );
  fsExt.mkdirpSync(path.join(bProPath, "foo"));
  fsExt.writeFileSync(
    path.join(bProPath, "foo", "foo1.txt"),
    "Bob changed foo...."
  );
  bPH.checkin();

  // Bob
  console.log("BOB LABEL foo_changed");
  manifestID = bMasManReader.getHead();
  bMasManWriter.addLabel(manifestID, "foo_changed");
}

function bobMergeWithAlice1() {
  console.log(
    "BOB 1ST MERGE WITH ALICE USING newFolder(Alice) and foo_change(Bob).\nSHOULD RETURNS 2 CONFLICTS: data.txt and foo/foo1.txt"
  );
  bPH.mergeOut("alice", "newFolder", "foo_changed");

  console.log("PRETEND BOB FIXES ALL CONFLICTS AND USE HIS COPY");
  const bobMergeOutMan = bManReader.getMan(bMasManReader.getHead());
  const conflictFiles = bobMergeOutMan.structure;
  conflictFiles.forEach(list => {
    const filePaths = Object.values(list);
    filePaths.forEach(file => {
      const dir = path.dirname(file);
      const extension = path.extname(file);
      const filename = path.basename(file, extension);

      const filenameWithUnderscore = filename.split("_")[0];

      // Choose _mt
      if (filename.includes("_mg") || filename.includes("_mr")) {
        fs.unlinkSync(file);
      } else {
        fs.renameSync(file, path.join(dir, filenameWithUnderscore + extension));
      }
    });
  });

  // Bob checkin
  console.log("BOB MERGE IN AFTER FIXING CONFLICTS");
  bPH.mergeIn();
}

function bobMergeWithAlice2() {
  // Alice
  console.log(
    "ALICE CHANGE\n FILE: \tdata.txt \n\tCONTENT: 'Alice goes to the coffee shop.'"
  );
  fsExt.writeFileSync(
    path.join(aProPath, "data.txt"),
    "Alice goes to the coffee shop."
  );
  aPH.checkin();

  console.log("ALICE LABEL data_changed'");
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, "data_changed");

  // Bob
  console.log(
    "BOB CREATE\n FILE: \tsample/sample1.txt \n\tCONTENT: 'Sample file'"
  );
  fsExt.mkdirpSync(path.join(bProPath, "sample"));
  fsExt.writeFileSync(
    path.join(bProPath, "sample", "sample1.txt"),
    "Sample file"
  );
  bPH.checkin();

  console.log("BOB LABEL recent");
  manifestID = bMasManReader.getHead();
  bMasManWriter.addLabel(manifestID, "recent");

  console.log(
    "BOB MERGE OUT WITH ALICE USING data_changed(Alice) and recent(Bob).\n THIS SHOULD RETURNS 2 CONFLICTS, data.txt and foo/foo1.txt"
  );
  bPH.mergeOut("alice", "data_changed", "recent");

  console.log("PRETEND BOB FIX ALL CONFLICT USING GRANDMA FILE");
  const bobMergeOutMan = bManReader.getMan(bMasManReader.getHead());
  const conflictFiles = bobMergeOutMan.structure;
  conflictFiles.forEach(list => {
    const filePaths = Object.values(list);
    filePaths.forEach(file => {
      const dir = path.dirname(file);
      const extension = path.extname(file);
      const filename = path.basename(file, extension);

      const filenameWithUnderscore = filename.split("_")[0];

      // Choose grandma
      if (filename.includes("_mr") || filename.includes("_mt")) {
        fs.unlinkSync(file);
      } else {
        fs.renameSync(file, path.join(dir, filenameWithUnderscore + extension));
      }
    });
  });

  console.log("BOB MERGE IN AFTER RESOLVING CONFLICTS");
  bPH.mergeIn();
}

function aliceProject2() {
  console.log("ALICE CREATE PROJECT BETA AND CHECKIN EMPTY PROJECT TREE");
  aPH2.create();
  aPH2.checkin();
}

/**
 * Reset alice and bob
 */
function reset() {
  fsExt.removeSync(path.join(DB_PATH, user1));
  fsExt.removeSync(path.join(DB_PATH, user2));
  fsExt.removeSync(path.join(ROOTPATH, DATABASE_NAME, USERS_FILENAME));
}
