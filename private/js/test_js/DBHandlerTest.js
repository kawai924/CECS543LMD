const DBHandler = require("./../DBHandler");
const fs = require("fs-extra");
const path = require("path");
const {
  ROOTPATH,
  DATABASE_NAME,
  ALL_USER_FILENAME
} = require("./../../../constants");

const databasePath = path.join(ROOTPATH, DATABASE_NAME);
const usersJSONPath = path.join(databasePath, ALL_USER_FILENAME);

console.log(usersJSONPath);
fs.removeSync(usersJSONPath);

const dbHandler = DBHandler();
dbHandler.getUsers();
dbHandler.addUser("Liam");
dbHandler.addProjectForUser("Liam", "ProjectBeta", "Get your own");
