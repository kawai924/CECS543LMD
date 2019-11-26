const { DB_PATH, MANIFEST_DIR, VSC_REPO_NAME } = require("./index");
const path = require("path");
const fs = require("fs");

const { MasterManReader } = require("./Master");

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
    const masMan = new MasterManReader(
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
    const masMan = new MasterManReader(
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

class ManifestWriter {
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
  ManifestReader,
  ManifestWriter
};
