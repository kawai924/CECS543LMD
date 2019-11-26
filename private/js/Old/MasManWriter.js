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

module.exports = class masterManWriter {
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

    fs.writeFileSync(this.masManFilePath, JSON.stringify(freshMasMan));
  }

  // tested
  addNewMan(man) {
    if (!this._isMasManPresent()) {
      this.writeFreshMasMan();
    }

    const masManReader = new masterManReader(this.username, this.projectName);
    const masManWriter = new masterManWriter(this.username, this.projectName);

    const masMan = masManReader.getMasMan();
    masMan.manifests.push(man);
    fs.writeFileSync(this.masManFilePath, JSON.stringify(masMan));

    // Update head
    masManWriter.addHead(man.manifestID);
  }

  //tested
  addLabel(manID, label) {
    const masManReader = new masterManReader(this.username, this.projectName);
    const masMan = masManReader.getMasMan();

    const newLabel = { [label]: manID };
    masMan.labels.push(newLabel);

    fs.writeFileSync(this.masManFilePath, JSON.stringify(masMan));
  }

  //tested
  addHead(newHead) {
    const masManReader = new masterManReader(this.username, this.projectName);
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
};

module.exports = {
  masterManReader,
  masterManWriter
};
