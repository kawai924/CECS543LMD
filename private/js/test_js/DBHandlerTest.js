const DBHandler = require("./../DBHandler");
const fs = require("fs-extra");
const path = require("path");
const {
  ROOTPATH,
  DATABASE_NAME,
  USERS_FILENAME
} = require("./../../../constants");

const databasePath = path.join(ROOTPATH, DATABASE_NAME);
const usersJSONPath = path.join(databasePath, USERS_FILENAME);

fs.removeSync(usersJSONPath);

const dbHandler = DBHandler();
dbHandler.getUsers();
dbHandler.addUser("Liam");
dbHandler.addProjectForUser("Liam", "ProjectBeta", "Get your own");
dbHandler.addProjectForUser("Liam", "ProjectAlpha", "Get your own");
dbHandler.addProjectForUser("Liam", "ProjectGamma", "Get your own");
dbHandler.updateProjectPath("Liam", "ProjectBeta", "Change path");
dbHandler.addUser("Shelby");
