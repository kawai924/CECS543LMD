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

class manifestWriter {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
    this.projectPath = path.join(DB_PATH, username, projectName);
    this.rPath = path.join(this.projectPath, VSC_REPO_NAME);
    this.manDirPath = path.join(this.rPath, MANIFEST_DIR);
  }

  /* Setters */
  addCommand(command) {
    this.command = command || "";
    return this;
  }

  addCheckoutFrom(fromPath) {
    this.fromPath = fromPath || "";
    return this;
  }

  // Add parents to the manifest file
  addParent(...parents) {
    this.parent = this.parent || [];
    parents.forEach(parent => {
      this.parent.push(parent);
    });

    return this;
  }

  addStructure(struct) {
    this.structure = struct || [];
    return this;
  }

  write(toPath) {
    toPath = toPath || this.manDirPath;
    const datetime = new Date();
    const id = datetime.getTime();

    const nMan = {
      user: this.username,
      project: this.projectName,
      structure: this.structure,
      parent: this.parent,
      command: this.command,
      fromPath: this.fromPath,
      datetime,
      id
    };

    const filePath = path.join(toPath, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(nMan));

    return {
      manifestID: id,
      manifestPath: filePath
    };
  }
}

module.exports = {
  manifestReader,
  manifestWriter
};
