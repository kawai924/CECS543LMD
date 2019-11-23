const ROOTPATH = __dirname;
const VSC_REPO_NAME = ".vcsx";
const MANIFEST_DIR = "manifests";
const MASTER_MANIFEST_NAME = "info.json";
const DATABASE_NAME = "database";
const ALL_USER_FILENAME = "users.json";
const PORT = 3000;

const COMMANDS = {
  CREATE: "create",
  CHECKIN: "check-in",
  CHECKOUT: "check-out",
  MERGE_OUT: "merge-out",
  MERGE_IN: "merge-in"
};

module.exports = {
  ROOTPATH,
  VSC_REPO_NAME,
  MANIFEST_DIR,
  MASTER_MANIFEST_NAME,
  DATABASE_NAME,
  ALL_USER_FILENAME,
  PORT,
  COMMANDS
};
