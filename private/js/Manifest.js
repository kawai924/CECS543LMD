/*
 * This file handle reading and writing relating to manifest.
 * Manifest contains information about artifacts in repo and other related information.
 * Authors: Liam Nguyen | Matt Nguyen | Marco Curci | Dennis Lo
 * Contacts: nguyen.dch@gmail.com | matthewnguyen19@gmail.com | marco.curci@student.csulb.edu | dennis.lo@student.csulb.edu
 * LMD VSC Control - CECS 543 - Fall 2019
 */

const path = require('path');
const fs = require('fs');

const { MasterManReader } = require('./Master');
const { DB_PATH, MANIFEST_DIR, VSC_REPO_NAME } = require('./index');

/**
 * Handle reading manifest file
 */
class ManifestReader {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
    this.repoPath = path.join(DB_PATH, username, projectName, VSC_REPO_NAME);
  }

  forUsername(username) {
    this.username = username;
  }

  forProjectName(projectName) {
    this.projectName = projectName;
  }

  /**
   * Get a manifest from disk
   * @param {Number | String} identification Either label or manifest ID
   * @returns {JSON} parsed JSON of a manifest
   */
  getMan(identification) {
    if (isNaN(identification)) {
      return this._getManByLabel(identification);
    }
    return this._getManByID(identification);
  }

  /**
   * Get particular artifact matching filename and relativePath
   * @param {String} fileName the filename of artifact
   * @param {String} relativePath the relative path of the artifact
   * @param {String | Number} identification the manifest ID or label of a manifest
   */
  getArtifact(fileName, relativePath, identification) {
    const manifest = this.getMan(identification);
    const artifactList = manifest.structure;

    for (let i = 0; i < artifactList.length; i++) {
      const artifact = artifactList[i];
      const fileNameFromArtifact = artifact.artifactNode.split(path.sep)[0];
      if (
        fileNameFromArtifact === fileName &&
        artifact.artifactRelPath === relativePath
      ) {
        return artifact;
      }
    }

    throw new Error(
      'Cannot find artifact with given file name and relative path!'
    );
  }

  /**
   * Get a manifest from disk by manifest ID
   * @param {Number} id manifest's ID
   * @throws {Error} if manifest cannot be found by manifest ID
   * @returns {JSON} parsed JSON of manifest if present. Else, throw error
   */
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

  /**
   * Get a manifest from disk by manifest's label
   * @param {String} inputLabel manifest's label
   * @throws {Error} if manifest cannot be found by label
   * @returns {JSON} parsed JSON of manifest if present. Else, throw error
   */
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

/**
 * Handle writing a manifest
 */
class ManifestWriter {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
    this.projectPath = path.join(DB_PATH, username, projectName);
    this.rPath = path.join(this.projectPath, VSC_REPO_NAME);
    this.manDirPath = path.join(this.rPath, MANIFEST_DIR);
  }

  /**
   * Add command to manifest builder
   * @param {String} command
   * @returns this instance
   */
  addCommand(command) {
    this.command = command || '';
    return this;
  }

  /**
   * Add parents to the manifest builder
   * @param  {...Object} parents : object = {parentID, parentPath}
   * @returns this instance
   */
  addParent(...parents) {
    this.parent = this.parent || [];
    parents.forEach(parent => {
      this.parent.push(parent);
    });

    return this;
  }

  /**
   * Add structure to manifest builder
   * @param {String[]} struct an array of all artifacts object {artifactID, artifactRelPath}
   * @returns this instance
   */
  addStructure(struct) {
    this.structure = struct || [];
    return this;
  }

  /**
   * Write manifest to disk
   * @param {String} toPath target path on the disk
   * @returns void
   */
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
