/*
 * This file handle reading and writing to master manifest.
 * Master manifest contains information about project and manifests.
 * Authors: Liam Nguyen | Matt Nguyen | Marco Curci | Dennis Lo
 * Contacts: nguyen.dch@gmail.com | matthewnguyen19@gmail.com | marco.curci@student.csulb.edu | dennis.lo@student.csulb.edu
 * LMD VSC Control - CECS 543 - Fall 2019
 */

const path = require('path');
const fs = require('fs');

const { DB_PATH, VSC_REPO_NAME, MASTER_MANIFEST_NAME } = require('./index');

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
    return this.getMasMan().head;
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
    const freshMasMan = {
      username: this.username,
      projectName: this.projectName,
      head: null,
      labels: [],
      manifests: []
    };

    this._rewriteMasMan(freshMasMan);
  }

  /**
   * Add information of a new manifest to the master manifest
   * @param {JSON} man manifest information. {manifestID, manifestPath}
   * @throws {Error} if master manifest cannot be written to the disk
   * @returns void
   */
  addNewMan(man) {
    // Write a new master manifest if not present.
    if (!this._isMasManPresent()) {
      this.writeFreshMasMan();
    }

    const masManReader = new MasterManReader(this.username, this.projectName);
    const masManWriter = new MasterManWriter(this.username, this.projectName);

    // Add manifest to master manifest
    const masMan = masManReader.getMasMan();
    masMan.manifests.push(man);
    this._rewriteMasMan(masMan);

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

    this._rewriteMasMan(masMan);
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

  /**** Private Functions
   ************************/

  /**
   * Write updated master manifest to file.
   * @param {JSON} updatedMasMan updated master manifest json
   * @returns void
   */
  _rewriteMasMan(updatedMasMan) {
    try {
      fs.writeFileSync(this.masManFilePath, JSON.stringify(updatedMasMan));
    } catch (e) {
      throw new Error('Unable to write updated master manifest.');
    }
  }

  /**
   * Check if master manifest is present
   * @returns {Boolean} true if present
   */
  _isMasManPresent() {
    return fs.existsSync(this.masManFilePath);
  }
}

module.exports = {
  MasterManReader,
  MasterManWriter
};
