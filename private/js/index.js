const path = require("path");

const ROOTPATH = path.join(__dirname, "../..");
const VSC_REPO_NAME = ".vcsx";
const MANIFEST_DIR = "manifests";
const MASTER_MANIFEST_NAME = "master-manifest.json";
const DATABASE_NAME = "database";
const USERS_FILENAME = "users.json";
const DEFAULT_USERNAME = "johndoe";

const DB_PATH = path.join(ROOTPATH, DATABASE_NAME);

const COMMANDS = {
  CREATE: "create",
  CHECKIN: "checkin",
  CHECKOUT: "checkout",
  MERGE_OUT: "mergeout",
  MERGE_IN: "mergein",
  LABEL: "label",
  REMOVE: "remove"
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
