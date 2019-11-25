const { DB_PATH, MANIFEST_DIR } = require("./index");
const path = require("path");
const fs = require("fs");

class manifestReader {
  constructor(username, projectName, id) {
    this.username = username;
    this.projectName = projectName;
    this.id = id;
  }

  retrieveMan() {}
}

class manifestWriter {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
    this.rPath = path.join(DB_PATH, username, projectName);
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
    toPath = toPath || path.join(this.rPath, MANIFEST_DIR);
    const datetime = new Date();
    const id = datetime.getTime();

    const nMan = {
      user: this.user,
      project: this.projectName,
      structure: this.structure,
      parent: this.parent,
      command: this.command,
      datetime,
      id
    };

    fs.writeFileSync(toPath, nMan);

    return {
      manifestID: id,
      toPath
    };
  }
}

module.exports = {
  manifestReader,
  manifestWriter
};
