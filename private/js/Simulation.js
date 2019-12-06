const fsExt = require('fs-extra');
const fs = require('fs');
const readlineSync = require('readline-sync');
const path = require('path');

const { ROOTPATH, DATABASE_NAME, USERS_FILENAME, DB_PATH } = require('.');
const { ProjectHandler } = require('./ProjectHandler');
const { MasterManReader, MasterManWriter } = require('./Master');
const { ManifestReader } = require('./Manifest');

const ALICE = 'alice';
const ALPHA = 'alpha';
const BETA = 'beta';
const aPH = new ProjectHandler(ALICE).forProject(ALPHA);

const BOB = 'bob';
const bPH = new ProjectHandler(BOB).forProject(ALPHA);
const bMasManReader = new MasterManReader(BOB, ALPHA);
const bManReader = new ManifestReader(BOB, ALPHA);

// Entry point
(function() {
  const tasks = [
    reset,
    aliceCreate,
    action1,
    action2,
    action3,
    action3a,
    action4,
    action5,
    action5a,
    action6
  ];

  let index = 0;
  console.log(
    '************************ WELCOME TO OUR TERMINAL SIMULATION! ************************'
  );
  console.log('NOTE: All projects are placed in DATABASE directory');
  console.log(
    '-----------------------------------------\nHow to run the simulation?\n 1: Run all\n Enter: Run step by step'
  );
  while (index < tasks.length) {
    let input = readlineSync.question();
    if (input === '1') {
      for (let i = index; i < tasks.length; i++) {
        tasks[i]();
      }
      break;
    } else {
      tasks[index]();
      index++;
    }
  }
})();

/************************ Scripts ************************/
function aliceCreate() {
  console.log('-----------------------------------------');
  console.log('TOPIC ~~>  Test Create()\n');
  console.log(`Alice creates project ${ALPHA}\n`);
  aPH.create();
  console.log(
    '*** SUMMARY ***\nAlice has empty project tree and version control set-up'
  );
}
function action1() {
  console.log('-----------------------------------------');
  console.log('TOPIC ~~> Test CHECKIN() and LABEL()\n');
  writeFile(ALICE, ALPHA, '.', 'data.txt', 'Alice writes Hello World.');
  writeFile(ALICE, ALPHA, 'foo', 'foo1.txt', "I'm foo.");
  writeFile(ALICE, ALPHA, path.join('bar', 'baz'), 'baz1.txt', "I'm so nested");
  addLabel(ALICE, ALPHA, 'alice1');
  console.log('*** SUMMARY ***\nAlice has 3 files and 3 directories.');
}

function action2() {
  console.log('-----------------------------------------');
  console.log('TOPIC ~~> Test CHECKOUT()\n');
  checkout(BOB, ALPHA, ALICE, 'alice1');
  writeFile(ALICE, ALPHA, 'new', 'status.txt', 'Happy');
  addLabel(ALICE, ALPHA, 'alice2');
  writeFile(BOB, ALPHA, 'new', 'status.txt', 'Happy');
  writeFile(ALICE, ALPHA, '.', 'data.txt', 'Alice changed data.txt');
  writeFile(BOB, ALPHA, '.', 'data.txt', 'Bob changed data.txt');
  writeFile(BOB, ALPHA, 'foo', 'foo_copy.txt', "I'm foo.");
  addLabel(BOB, ALPHA, 'bob1');
  console.log(
    "*** SUMMARY ***\nBob & Alice both have status.txt with the same content.\nThey have conflict at data.txt.\nAlice's foo1.txt and Bob's foo_copy.txt have same content but different file names"
  );
}

function action3() {
  console.log('-----------------------------------------');
  console.log('TOPIC ~~>  Test MERGEOUT()\n');
  console.log('*** NOTE ***');
  console.log('data.txt: same filename, different artifact --> conflict');
  console.log('status.txt: same filename, same artifact --> No conflict');
  console.log(
    'foo.txt & foo_copy.txt: different filename, same artifact --> No conflict'
  );
  mergeout(BOB, ALPHA, ALICE, 'alice2', 'bob1');
  console.log('*** SUMMARY ***\nBob has conflicts in project tree.');
}

function action3a() {
  console.log('-----------------------------------------');
  console.log('TOPIC ~~>  AUTOMATICALLY RESOLVE CONFLICTS\n');
  console.log('Pretend Bob fix all conflicts by using his copy (keep _mt)\n');
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

  console.log('Bob merges-in after fixing all conflicts\n');
  bPH.mergeIn();
  console.log(
    '*** SUMMARY ***\nBob fixed all conflicts and created merge-in manifest.'
  );
}

function action4() {
  console.log('-----------------------------------------');
  console.log('TOPIC ~~>  PREPARING FOR ANOTHER MERGEOUT()\n');
  writeFile(ALICE, ALPHA, 'new', 'status.txt', 'Alice is sad');
  writeFile(ALICE, ALPHA, '.', 'data.txt', 'Alice goes to the coffee shop.');
  addLabel(ALICE, ALPHA, 'data_changed');
  writeFile(BOB, ALPHA, 'sample', 'sample1.txt', 'Sample file');
  addLabel(BOB, ALPHA, 'recent');
  console.log(
    "*** SUMMARY ***\nAlice and Bob's data.txt and status.txt have different content.\n"
  );
}

function action5() {
  console.log('-----------------------------------------');
  console.log('TOPIC ~~>  2nd MERGEOUT()\n');
  console.log('data.txt: same filename, different artifact --> conflict');
  console.log('status.txt: same filename, different artifact --> conflict');
  mergeout(BOB, ALPHA, ALICE, 'data_changed', 'recent');
}

function action5a() {
  console.log('-----------------------------------------');
  console.log('TOPIC ~~>  AUTOMATICALLY RESOLVE CONFLICTS\n');
  console.log('Pretend Bob resolve all conflicts using grandma (_mg) file\n');
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

function action6() {
  console.log('-----------------------------------------');
  console.log(
    'TOPIC ~~>  CREATE 2nd PROJECT AND CHECKIN() EMPTY PROJECT TREE\n'
  );
  console.log(
    'Alice creates and check-in project beta and check in empty project tree\n'
  );
  aPH.forProject(BETA);
  aPH.create();
  aPH.checkin();
  console.log('--------------------END--------------------');
}

function reset() {
  console.log('-----------------------------------------');
  console.log('TOPIC ~~> RESET EVERYTHING');
  console.log('Erase Alice and Bob\n');
  fsExt.removeSync(path.join(DB_PATH, ALICE));
  fsExt.removeSync(path.join(DB_PATH, BOB));
  fsExt.removeSync(path.join(ROOTPATH, DATABASE_NAME, USERS_FILENAME));
}

/** Shortcuts Functions */
function writeFile(username, projectName, directory, filename, content) {
  const projectHandler = new ProjectHandler(username).forProject(projectName);

  const projectPath = projectHandler.projectPath;

  // Make directories
  fs.mkdirSync(path.join(projectPath, directory), { recursive: true });
  // Write file
  fs.writeFileSync(path.join(projectPath, directory, filename), content);
  // Check in
  projectHandler.checkin();
  console.log(
    `USER ${username} - PROJECT ${projectName} | writes & checks-in filename : ${filename} - content: "${content}" - under directory: "${directory}"\n`
  );
}

function addLabel(username, projectName, label) {
  const masManReader = new MasterManReader(username, projectName);
  const masManWriter = new MasterManWriter(username, projectName);

  const headID = masManReader.getHead();
  masManWriter.addLabel(headID, label);

  console.log(
    `USER ${username} - PROJECT ${projectName} | labels ID: ${headID} - label name: "${label}"\n`
  );
}

function checkout(username, fProjectName, fUsername, fID) {
  const projectHandler = new ProjectHandler(username).forProject(fProjectName);
  projectHandler.checkout(fUsername, fProjectName, fID);
  console.log(
    `USER ${username} check-out PROJECT ${fProjectName} from ${fUsername} using label: "${fID}"\n`
  );
}

function mergeout(username, projectName, fUsername, fID, tID) {
  console.log(
    `USER ${username} PROJECT ${projectName} | merge-out with USER: ${fUsername} - label: "${fID}" | USER: ${username} - label: "${tID}"\n`
  );
  const projectHandler = new ProjectHandler(username).forProject(projectName);
  projectHandler.mergeOut(fUsername, fID, tID);
}
