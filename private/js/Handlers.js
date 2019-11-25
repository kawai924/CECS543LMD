const {
  DB_PATH,
  MANIFEST_DIR,
  VSC_REPO_NAME,
  MASTER_MANIFEST_NAME
} = require("./index");
const path = require("path");
const fs = require("fs");

class manifestReader {
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
      toPath
    };
  }
}

class masterManReader {
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
}

class masterManWriter {
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
    if (!this._isMasManPresent) {
      this.writeFreshMasMan();
    }

    const masManReader = new masterManReader(this.username, this.projectName);
    const masMan = masManReader.getMasMan();
    masMan.manifests.push(man);

    fs.writeFileSync(this.masManFilePath, JSON.stringify(masMan));
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
  getHead() {
    const masManReader = new masterManReader(this.username, this.projectName);
    const masMan = masManReader.getMasMan();

    return masMan.head;
  }

  //tested
  writeHead(newHead) {
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
      throw new Error("Master Manifest does not exist");
    }
  }
}

class ProjectHandler {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
    this.projectPath = path.join(DB_PATH, username, projectName);
    this.repoPath = path.join(this.projectPath, VSC_REPO_NAME);
  }

  create() {
    // Step 1: Create all neccessary folder
    fs.mkdirSync(this.repoPath, { recursive: true });

    // Step 2: Get all neccessary handlers
    const masManWriter = new masterManWriter(this.username, this.projectName);
    const manWriter = new manifestWriter(this.username, this.projectName);
  }
}
module.exports = {
  manifestReader,
  manifestWriter,
  masterManReader,
  masterManWriter
};
