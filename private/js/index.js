/*
 * This file stores all constants.
 * Authors: Liam Nguyen | Matt Nguyen | Marco Curci | Dennis Lo
 * Contacts: nguyen.dch@gmail.com | matthewnguyen19@gmail.com | marco.curci@student.csulb.edu | dennis.lo@student.csulb.edu
 * LMD VSC Control - CECS 543 - Fall 2019
 */

const path = require('path');

/** Store all constants */

/** Path constants */
const ROOTPATH = path.join(__dirname, '../..');
const VSC_REPO_NAME = '.vcsx';
const MANIFEST_DIR = 'manifests';
const MASTER_MANIFEST_NAME = 'master-manifest.json';
const DATABASE_NAME = 'database';
const USERS_FILENAME = 'users.json';
const DEFAULT_USERNAME = 'johndoe';
const DB_PATH = path.join(ROOTPATH, DATABASE_NAME);

/** Commands available */
const COMMANDS = {
  CREATE: 'create',
  CHECKIN: 'checkin',
  CHECKOUT: 'checkout',
  MERGE_OUT: 'mergeout',
  MERGE_IN: 'mergein',
  LABEL: 'label',
  REMOVE: 'remove'
};

module.exports = {
  ROOTPATH,
  VSC_REPO_NAME,
  MANIFEST_DIR,
  MASTER_MANIFEST_NAME,
  DATABASE_NAME,
  USERS_FILENAME,
  COMMANDS,
  DB_PATH,
  DEFAULT_USERNAME
};
