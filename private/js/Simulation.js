const fsExt = require('fs-extra');
const fs = require('fs');
const readlineSync = require('readline-sync');
const path = require('path');

const { ROOTPATH, DATABASE_NAME, USERS_FILENAME, DB_PATH } = require('.');
const { ProjectHandler } = require('./ProjectHandler');
const { MasterManReader, MasterManWriter } = require('./Master');
const { ManifestReader } = require('./Manifest');

let manifestID;
const user1 = 'alice';
const aProj1 = 'alpha';
const aProj2 = 'beta';
const aPH = new ProjectHandler(user1).forProject(aProj1);
const aProPath = aPH.projectPath;
const aMasManReader = new MasterManReader(user1, aProj1);
const aMasManWriter = new MasterManWriter(user1, aProj1);

const user2 = 'bob';
const bProj1 = aProj1;
const bPH = new ProjectHandler(user2).forProject(bProj1);
const bProPath = bPH.projectPath;
const bMasManReader = new MasterManReader(user2, bProj1);
const bMasManWriter = new MasterManWriter(user2, bProj1);
const bManReader = new ManifestReader(user2, bProj1);

// All simulation commands
const simulations = [
  reset,
  aliceCreate,
  aliceBeforeBobCheckout,
  bobCheckOutAlice,
  bobMergeWithAlice1,
  bobResolveMergeConflict1,
  bobMergeWithAlice2,
  bobResolveMergeConflict2,
  aliceProject2
];

// Simulation logic
let index = 0;
console.log('Welcome to our terminal simulation!');
console.log('All projects are placed in DATABASE directory');
console.log(
  '-----------------------------------------\nHow to run the simulation?\n 1: Run all\n Enter: Run step by step'
);
while (index < simulations.length) {
  let input = readlineSync.question('> ');
  if (input === '1') {
    for (let i = index; i < simulations.length; i++) {
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
  console.log(`Alice creates project ${aProj1}\n`);
  aPH.create();
  console.log('-----------------------------------------');
}
function aliceBeforeBobCheckout() {
  console.log(
    "Alice creates and check-in \n file: \tdata.txt \n\tcontent: 'Alice writes Hello World'\n"
  );
  fsExt.writeFileSync(
    path.join(aProPath, 'data.txt'),
    'Alice writes Hello World'
  );
  aPH.checkin();

  console.log(
    "Alice creates and check-in\n file: \tfoo/foo1.txt \n\tcontent: 'I'm foo'\n"
  );
  fsExt.mkdirpSync(path.join(aProPath, 'foo'));
  fsExt.writeFileSync(path.join(aProPath, 'foo', 'foo1.txt'), "I'm foo");
  aPH.checkin();

  console.log('Alice adds label foo\n');
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, 'foo');

  console.log(
    "Alice creates and check-in\n file: \tbar/baz/baz1.txt \n\tcontent: 'I'm under bar/baz'\n"
  );
  fsExt.mkdirpSync(path.join(aProPath, 'bar', 'baz'), {
    recursive: true
  });
  fsExt.writeFileSync(
    path.join(aProPath, 'bar', 'baz', 'baz1.txt'),
    "I'm under bar/baz"
  );
  aPH.checkin();

  console.log(
    "Alice creates and check-in\n file: \tnew/status.txt \n\tcontent: 'Blank'\n"
  );
  fsExt.mkdirpSync(path.join(aProPath, 'new'), {
    recursive: true
  });
  fsExt.writeFileSync(path.join(aProPath, 'new', 'status.txt'), 'Blank');
  aPH.checkin();

  // console.log(
  //   "Alice changes\n file: \tfoo/foo1.txt \n\tcontent: 'Alice said good-bye...'\n"
  // );
  // fsExt.mkdirpSync(path.join(aProPath, 'foo'));
  // fsExt.writeFileSync(
  //   path.join(aProPath, 'foo', 'foo1.txt'),
  //   'Alice said good-bye...'
  // );
  // aPH.checkin();

  console.log('Alice adds label alice1\n');
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, 'alice1');

  console.log('-----------------------------------------');
}

function bobCheckOutAlice() {
  console.log("Bob checkout Alice using label: 'alice1'\n");
  // Bob
  bPH.checkout(user1, aProj1, 'alice1');

  // Alice
  console.log(
    "Alice creates and check-in\n file: \tnew/status.txt\n\tcontent: 'Happy'\n"
  );
  fsExt.mkdirpSync(path.join(aProPath, 'new'));
  fsExt.writeFileSync(path.join(aProPath, 'new', 'status.txt'), 'Happy');
  aPH.checkin();

  // Alice
  console.log('Alice adds label newFolder\n');
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, 'newFolder');

  // Bob
  console.log(
    "Bob creates and check-in\n file: \tnew/status.txt\n\tcontent: 'Happy'\n"
  );
  fsExt.mkdirpSync(path.join(bProPath, 'new'));
  fsExt.writeFileSync(path.join(bProPath, 'new', 'status.txt'), 'Happy');
  bPH.checkin();

  // Bob
  console.log('Bob adds label newFolder\n');
  manifestID = bMasManReader.getHead();
  bMasManWriter.addLabel(manifestID, 'newFolder');

  // Alice
  console.log(
    "Alice changes\n file: \tdata.txt \n\tcontent: 'Alice comes back'\n"
  );
  fsExt.writeFileSync(path.join(aProPath, 'data.txt'), 'Alice comes back');
  aPH.checkin();

  // Alice
  console.log(
    "Alice changes\n file: \tsecret/journal.txt \n\tcontent: 'Don't read me'\n"
  );
  fsExt.mkdirpSync(path.join(aProPath, 'secret'), {
    recursive: true
  });
  fsExt.writeFileSync(
    path.join(aProPath, 'secret', 'journal.txt'),
    "Don't read me"
  );
  aPH.checkin();

  // Alice
  console.log('Alice adds label journal\n');
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, 'journal');

  // Bob overwrites data.txt
  console.log(
    "Bob changes\n file: \tdata.txt \n\tcontent: 'Bob just swings by...'\n"
  );
  fsExt.writeFileSync(path.join(bProPath, 'data.txt'), 'Bob just swings by...');
  bPH.checkin();

  // Bob overwrites foo1.txt
  console.log(
    "Bob changes\n file: \tfoo/foo1.txt \n\tcontent: 'Bob changed foo....'\n"
  );
  fsExt.mkdirpSync(path.join(bProPath, 'foo'));
  fsExt.writeFileSync(
    path.join(bProPath, 'foo', 'foo1.txt'),
    'Bob changed foo....'
  );
  bPH.checkin();

  // Bob
  console.log('Bob adds label foo_changed\n');
  manifestID = bMasManReader.getHead();
  bMasManWriter.addLabel(manifestID, 'foo_changed');

  console.log('-----------------------------------------');
}

function bobMergeWithAlice1() {
  console.log(
    'Bob 1st merge with alice using labels newFolder(Alice) and foo_change(Bob).\n'
  );
  console.log(
    'This should cause 2 conflicts: data.txt and foo/foo1.txt.\n No conflict at new/status.txt because of same content.\n'
  );
  bPH.mergeOut('alice', 'newFolder', 'foo_changed');

  console.log('-----------------------------------------');
}

function bobResolveMergeConflict1() {
  console.log('Pretend Bob fix all conflicts by using his copy\n');
  const bobMergeOutMan = bManReader.getMan(bMasManReader.getHead());
  const conflictFiles = bobMergeOutMan.structure;
  conflictFiles.forEach(list => {
    const filePaths = Object.values(list);
    filePaths.forEach(file => {
      const dir = path.dirname(file);
      const extension = path.extname(file);
      const filename = path.basename(file, extension);

      const filenameWithUnderscore = filename.split('_')[0];

      // Choose _mt
      if (filename.includes('_mg') || filename.includes('_mr')) {
        fs.unlinkSync(file);
      } else {
        fs.renameSync(file, path.join(dir, filenameWithUnderscore + extension));
      }
    });
  });

  // Bob checkin
  console.log('Bob merges in after fixing all conflicts\n');
  bPH.mergeIn();

  console.log('-----------------------------------------');
}

function bobMergeWithAlice2() {
  // Alice
  console.log(
    "Alice changes\n file: \tdata.txt \n\tcontent: 'Alice goes to the coffee shop.'\n"
  );
  fsExt.writeFileSync(
    path.join(aProPath, 'data.txt'),
    'Alice goes to the coffee shop.'
  );
  aPH.checkin();

  console.log("Alice adds label data_changed'\n");
  manifestID = aMasManReader.getHead();
  aMasManWriter.addLabel(manifestID, 'data_changed');

  // Bob
  console.log(
    "BOB creates and check-in \n file: \tsample/sample1.txt \n\tcontent: 'Sample file'\n"
  );
  fsExt.mkdirpSync(path.join(bProPath, 'sample'));
  fsExt.writeFileSync(
    path.join(bProPath, 'sample', 'sample1.txt'),
    'Sample file'
  );
  bPH.checkin();

  console.log('Bob adds label recent\n');
  manifestID = bMasManReader.getHead();
  bMasManWriter.addLabel(manifestID, 'recent');

  console.log(
    'Bob merges out with alice using labels data_changed(Alice) and recent(Bob).\n'
  );
  console.log(
    'This should still causes 2 conflicts: data.txt and foo/foo1.txt\n'
  );
  bPH.mergeOut('alice', 'data_changed', 'recent');

  console.log('-----------------------------------------');
}

function bobResolveMergeConflict2() {
  console.log('Pretend Bob resolve all conflicts using grandma file\n');
  const bobMergeOutMan = bManReader.getMan(bMasManReader.getHead());
  const conflictFiles = bobMergeOutMan.structure;
  conflictFiles.forEach(list => {
    const filePaths = Object.values(list);
    filePaths.forEach(file => {
      const dir = path.dirname(file);
      const extension = path.extname(file);
      const filename = path.basename(file, extension);

      const filenameWithUnderscore = filename.split('_')[0];

      // Choose _mg
      if (filename.includes('_mr') || filename.includes('_mt')) {
        fs.unlinkSync(file);
      } else {
        fs.renameSync(file, path.join(dir, filenameWithUnderscore + extension));
      }
    });
  });

  console.log('Bob merges in after resolving conflicts\n');
  bPH.mergeIn();

  console.log('-----------------------------------------');
}

function aliceProject2() {
  console.log(
    'Alice creates and check-in project beta and check in empty project tree\n'
  );
  aPH.forProject(aProj2);
  aPH.create();
  aPH.checkin();

  console.log('--------------------END--------------------');
}

/**
 * Reset alice and bob
 */
function reset() {
  console.log('Erase Alice and Bob\n');
  fsExt.removeSync(path.join(DB_PATH, user1));
  fsExt.removeSync(path.join(DB_PATH, user2));
  fsExt.removeSync(path.join(ROOTPATH, DATABASE_NAME, USERS_FILENAME));

  console.log('-----------------------------------------');
}
