const {
  DB_PATH,
  MANIFEST_DIR,
  VSC_REPO_NAME,
  MASTER_MANIFEST_NAME,
  COMMANDS
} = require("./index");
const path = require("path");
const fs = require("fs");

class MasterManReader {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
    this.rPath = path.join(DB_PATH, username, projectName, VSC_REPO_NAME);
  }

  /** Get master manifest */
  //tested
  getMasMan() {
    const masManFilePath = path.join(this.rPath, MASTER_MANIFEST_NAME);
    if (!fs.existsSync(masManFilePath)) {
      throw new Error("Invalid master manifest file path");
    }
    return JSON.parse(fs.readFileSync(masManFilePath));
  }

  //tested
  getHead() {
    const masManReader = new MasterManReader(this.username, this.projectName);
    return masManReader.getMasMan().head;
  }
}

class MasterManWriter {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
    this.masManFilePath = path.join(
      DB_PATH,
      username,
      projectName,
      VSC_REPO_NAME,
      MASTER_MANIFEST_NAME
    );
  }

  //tested
  writeFreshMasMan(toPath) {
    toPath = toPath || this.masManFilePath;

    const freshMasMan = {
      username: this.username,
      projectName: this.projectName,
      head: null,
      labels: [],
      manifests: []
    };
    try {
      fs.writeFileSync(this.masManFilePath, JSON.stringify(freshMasMan));
    } catch (e) {
      throw new Error("Unable to write fresh master manifest file");
    }
  }

  // tested
  addNewMan(man) {
    if (!this._isMasManPresent()) {
      this.writeFreshMasMan();
    }

    const masManReader = new MasterManReader(this.username, this.projectName);
    const masManWriter = new MasterManWriter(this.username, this.projectName);

    const masMan = masManReader.getMasMan();
    masMan.manifests.push(man);
    try {
      fs.writeFileSync(this.masManFilePath, JSON.stringify(masMan));
    } catch (e) {
      throw new Error("Unable to write master manifest to add new manifest");
    }
    // Update head
    masManWriter.addHead(man.manifestID);
  }

  //tested
  addLabel(manID, label) {
    const masManReader = new MasterManReader(this.username, this.projectName);
    const masMan = masManReader.getMasMan();

    const newLabel = { [label]: manID };
    masMan.labels.push(newLabel);
    try {
      fs.writeFileSync(this.masManFilePath, JSON.stringify(masMan));
    } catch (e) {
      throw new Error("Unable to write master manifest to update label");
    }
  }

  //tested
  addHead(newHead) {
    const masManReader = new MasterManReader(this.username, this.projectName);
    const masMan = masManReader.getMasMan();
    masMan.head = newHead;

    fs.writeFileSync(this.masManFilePath, JSON.stringify(masMan));
  }

  _isMasManPresent() {
    try {
      let output = fs.readFileSync(this.masManFilePath);
      return output.length > 0;
    } catch (e) {
      this.writeFreshMasMan();
    }
  }
}

module.exports = {
  MasterManReader,
  MasterManWriter
};
