const { DB_PATH, VSC_REPO_NAME, MASTER_MANIFEST_NAME } = require("./index");
const path = require("path");
const fs = require("fs");

/**
 * Handle reading master manifest file
 */
class MasterManReader {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
    this.rPath = path.join(DB_PATH, username, projectName, VSC_REPO_NAME);
  }

  /**
   * Read master manifest from disk
   * @throws {Error} if master manifest of a project doesn't exist
   * @returns {JSON} parsed JSON of master manifest file.
   */
  getMasMan() {
    const masManFilePath = path.join(this.rPath, MASTER_MANIFEST_NAME);
    if (!fs.existsSync(masManFilePath)) {
      throw new Error(
        `Can't get master manifest from project ${this.projectName} of ${this.username}. Please manually delete the directory.`
      );
    }

    return JSON.parse(fs.readFileSync(masManFilePath));
  }

  /**
   * Get the ID of HEAD manifest (most recent manifest)
   * @returns {Number} HEAD manifest ID
   */
  getHead() {
    const masManReader = new MasterManReader(this.username, this.projectName);
    return masManReader.getMasMan().head;
  }
}

/**
 * Handle writing to master manifest
 */
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

  /**
   * Write a new master manifest to disk
   * @param {String} toPath The path the master manifest will be written to.
   * @throws {Error} if master manifest cannot be written to disk
   * @returns void
   */
  writeFreshMasMan(toPath = this.masManFilePath) {
    // toPath = toPath || this.masManFilePath;

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

  /**
   * Add information of a new manifest to the master manifest
   * @param {JSON} man manifest information. {manifestID, manifestPath}
   * @throws {Error} if master manifest cannot be written to the disk
   * @returns void
   */
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

  /**
   *
   * @param {Number} manID
   * @param {String} label
   * @throws {Error} if master manifest cannot be written to the disk
   * @returns void
   */
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

  /**
   * Update HEAD ID in master manifest
   * @param {Number} newHead ID of the most recent manifest
   * @returns void
   */
  addHead(newHead) {
    const masManReader = new MasterManReader(this.username, this.projectName);
    const masMan = masManReader.getMasMan();
    masMan.head = newHead;

    fs.writeFileSync(this.masManFilePath, JSON.stringify(masMan));
  }

  /**
   * Check if master manifest is present
   * @returns {Boolean} true if present
   */
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
