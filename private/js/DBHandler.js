/**
 * This handler allows use to organize all users who using our VSC systems.
 * Features:
 *      - Record all users and their projects path.
 *
 * Format:
 *      username : [
 *         {projectName1 : projectPath1}
 *         {projectName2 : projectPath2}
 *          .....
 *      ]
 */

/********** IMPORT MODULES **********/
const path = require("path");
const fs = require("fs");

const {
  ROOTPATH,
  VSC_REPO_NAME,
  MANIFEST_DIR,
  DATABASE_NAME,
  MASTER_MANIFEST_NAME,
  ALL_USER_FILENAME
} = require("../../constants");
/****************************************/

const DatabaseHandler = () => {
  const _databasePath = path.join(ROOTPATH, DATABASE_NAME);
  const _FILENAME = ALL_USER_FILENAME;
  const _filePath = path.join(_databasePath, _FILENAME);

  /** Public Interface **/
  const getUsers = () => {
    if (!isUsersJSONPresent()) {
      writeFreshAllUserInfo();
    }

    return JSON.parse(fs.readFileSync(_filePath));
  };

  const addUser = username => {
    // Only add new user
    if (!isUserPresent(username)) {
      const users = getUsers();
      users[username] = [];
      updateUsersJSON(users);
    } else {
      throw new Error("Can't add an existing user");
    }
  };

  const addProjectForUser = (username, projectName, projectPath) => {
    const users = getUsers();

    if (isUserPresent(username) && !isProjectPresent(username, projectName)) {
      users[username].push({
        [projectName]: projectPath
      });

      updateUsersJSON(users);
    } else {
      throw new Error("Can't add an existing project");
    }
  };

  /** Private Functions **/
  const writeFreshAllUserInfo = () => {
    fs.writeFileSync(_filePath, JSON.stringify({}));
  };

  const isUsersJSONPresent = () => {
    return fs.existsSync(_filePath);
  };

  const updateUsersJSON = newUserJSON => {
    fs.writeFileSync(_filePath, JSON.stringify(newUserJSON));
  };

  const isUserPresent = username => {
    return Object.keys(getUsers()).includes(username);
  };

  const isProjectPresent = (username, projectName) => {
    const users = getUsers();

    if (isUserPresent(username)) {
      const projectList = users[username];
      for (let i = 0; i < projectList.length; i++) {
        const [currentProjectName] = Object.keys(projectList[i]);
        if (currentProjectName === projectName) {
          return true;
        }
      }
    }

    return false;
  };

  const getUser = username => {
    const userJSON = getUsers().allUsers;

    if (isUserPresent(username)) {
      userJSON.allUsers[username].push({
        projectName,
        projectPath
      });
    }
  };

  /** RETURN PUBLIC INTERFACE **/
  return {
    getUsers,
    addUser,
    addProjectForUser
  };
};

module.exports = DatabaseHandler;
