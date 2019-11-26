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

class MasterManReader {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
    this.rPath = path.join(
      DB_PATH,
      username,
      projectName,
      VSC_REPO_NAME,
      MASTER_MANIFEST_NAME
    );
  }

  /** Get master manifest */
  //tested
  getMasMan() {
    return JSON.parse(fs.readFileSync(this.rPath));
  }

  //tested
  getHead() {
    const masManReader = new MasterManReader(this.username, this.projectName);
    const masMan = masManReader.getMasMan();

    return masMan.head;
  }
}

module.exports = {
  MasterManReader
};
