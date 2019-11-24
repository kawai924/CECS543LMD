const path = require("path");
const {
  ROOTPATH,
  VSC_REPO_NAME,
  MANIFEST_DIR,
  MASTER_MANIFEST_NAME,
  DATABASE_NAME
} = require("./../../constants");

/**
 * This function is to encapsulate the path of a particular project.
 * Parameters:
 *  - username: required
 *  - projectName: required
 *  - projectAbsPath: optional. The default location is assumed in DATABASE
 */
const PathHandler = (
  username,
  projectName,
  projectAbsPath = path.join(ROOTPATH, DATABASE_NAME, username, projectName)
) => {
  let _username = username;
  let _projectName = projectName;
  let _projectPath = projectAbsPath;

  const getProjectPath = () => {
    return _projectPath;
  };

  const getManifestDirPath = () => {
    return path.join(_projectPath, VSC_REPO_NAME, MANIFEST_DIR);
  };

  const getInfoJSONPath = () => {
    return path.join(_projectPath, VSC_REPO_NAME, MASTER_MANIFEST_NAME);
  };

  return {
    getProjectPath,
    getManifestDirPath,
    getInfoJSONPath,
    toString
  };
};

module.exports = PathHandler;
