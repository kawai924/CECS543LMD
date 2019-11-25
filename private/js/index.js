const fs = require("fs");
const path = require("path");
const fsExt = require("fs-extra");

const ROOTPATH = path.join(__dirname, "../..");
const VSC_REPO_NAME = ".vcsx";
const MANIFEST_DIR = "manifests";
const MASTER_MANIFEST_NAME = "info.json";
const DATABASE_NAME = "database";
const USERS_FILENAME = "users.json";

const DB_PATH = path.join(ROOTPATH, DATABASE_NAME);

const COMMANDS = {
  CREATE: "create",
  CHECKIN: "checkin",
  CHECKOUT: "checkout",
  MERGE_OUT: "mergeout",
  MERGE_IN: "mergein",
  LABEL: "label"
};

module.exports = {
  fs,
  path,
  fsExt,
  ROOTPATH,
  VSC_REPO_NAME,
  MANIFEST_DIR,
  MASTER_MANIFEST_NAME,
  DATABASE_NAME,
  USERS_FILENAME,
  COMMANDS,
  DB_PATH
};
