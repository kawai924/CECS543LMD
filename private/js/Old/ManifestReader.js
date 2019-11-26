const {
  DB_PATH,
  MANIFEST_DIR,
  VSC_REPO_NAME,
  MASTER_MANIFEST_NAME,
  COMMANDS
} = require("../index");
const path = require("path");
const fs = require("fs");
const { copyDirTree, makeDirSync } = require("../Functions");

class ManifestReader {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
    this.repoPath = path.join(DB_PATH, username, projectName);
  }

  getMan(identification) {
    if (isNaN(identification)) {
      return this._getManByLabel(identification);
    }
    return this._getManByID(identification);
  }

  // Fix after change the labels' structure
  _getManByID(id) {
    const masMan = new masterManReader(
      this.username,
      this.projectName
    ).getMasMan();

    let output;
    masMan.manifests.forEach(man => {
      if (man.manifestID == id) {
        output = man;
      }
    });

    if (output === undefined) {
      throw new Error(`Unable to find manifest by ID`);
    }

    return this._getManByPath(output.manifestPath);
  }

  // Fix after change the labels' structure
  _getManByLabel(inputLabel) {
    const masMan = new masterManReader(
      this.username,
      this.projectName
    ).getMasMan();

    let output;
    masMan.labels.forEach(label => {
      const [lName] = Object.keys(label);
      if (lName === inputLabel) {
        output = label[lName];
      }
    });

    if (output === undefined) {
      throw new Error(`Unable to find manifest by Label`);
    }

    return this._getManByID(output);
  }

  _getManByPath(manPath) {
    return JSON.parse(fs.readFileSync(manPath));
  }
}

module.exports = {
  ManifestReader
};
