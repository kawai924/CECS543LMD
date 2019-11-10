const fs = require('fs');
const path = require('path');
const { makeDir } = require('./FolderFunctions');

module.exports = class Manifest {
  constructor({ userName, repoName, destRepoPath }) {
    this.paths = {
      destRepoPath,
      masterJsonPath: path.join(destRepoPath, 'master_manifest.json')
    };
    this.newManifest = {
      user: userName,
      repo: repoName,
      structure: []
    };

    this.masterManifest = this.getMasterManifest(); // Store master manifest
  }

  /* Setters */
  addCommand(command) {
    this.newManifest.command = command;
  }

  addStructure(folderStructure) {
    this.newManifest.structure = folderStructure;
  }

  addLabel(manifestID, label) {
    this.masterManifest.labels.push({ [label]: manifestID });

    // Update the master manifest
    this.rewriteMasterManifest();
  }

  /* Get manifest path from an id. ID can be LABEL or NUMBER */
  getManifestPath(id) {
    let idFromLabel = null;
    // Check each key in the labels array
    this.masterManifest.labels.forEach(label => {
      if (Object.keys(label)[0] === id) {
        idFromLabel = label[id];
      }
    });
    const manifestID = idFromLabel || id;
    return this.masterManifest.manifest_lists[manifestID.toString()] || false;
  }

  /* Write manifest into file and update master manifest */
  write({ checkoutPath } = {}) {
    const newID =
      Object.keys(this.masterManifest.manifest_lists).length + 1 || 1;
    this.newManifest.id = newID;
    this.newManifest.datetime = new Date();

    const manifestName = 'manifest_' + newID.toString() + '.json';
    const newManifestPath = path.join(
      this.paths.destRepoPath,
      'manifests',
      manifestName
    );

    // For "checkout" command, add checkout path to the destination repo
    if (this.newManifest.command === 'checkout') {
      if (checkoutPath === '')
        throw new Error("manifest.write() doesn't have checkoutPath");
      this.newManifest.checkoutPath = path.join(
        checkoutPath,
        this.newManifest.user,
        this.newManifest.repo
      );
    }

    try {
      // Write manifest file into the manifest folder
      fs.writeFileSync(newManifestPath, JSON.stringify(this.newManifest));
    } catch (err) {
      console.log('Unable to write manifest file!!!', err);
    }

    // Update the master manifest
    this.masterManifest.manifest_lists[newID] = newManifestPath;
    this.rewriteMasterManifest();
  }

  /* Helper functions */
  /* Grab master manifest */
  getMasterManifest() {
    // Create repo folder under database/[userName]/[repoName]
    makeDir(this.paths.destRepoPath, { recursive: true });
    // Create folder named "manifests" with path: database/[userName]/[repoName]/manifests
    makeDir(path.join(this.paths.destRepoPath, 'manifests'), {
      recursive: true
    });

    // Check if master_manifest.json exists. If not, create.
    if (!fs.existsSync(this.paths.masterJsonPath)) {
      const newMasterManifest = {
        manifest_lists: {},
        labels: []
      };
      fs.writeFileSync(
        this.paths.masterJsonPath,
        JSON.stringify(newMasterManifest)
      );
      return newMasterManifest;
    }

    // Grab the master_manifest.json file as a buffer, then convert into strings then parse.
    return JSON.parse(fs.readFileSync(this.paths.masterJsonPath).toString());
  }

  /* Update or write a new master manifest */
  rewriteMasterManifest(alternatePath = undefined) {
    if (alternatePath) {
      try {
        fs.writeFileSync(
          this.paths.masterJsonPath,
          JSON.stringify(this.masterManifest)
        );
      } catch (err) {
        console.log(
          'Unable to write master manifest file into alternate path!!!',
          err
        );
      }
    }

    try {
      fs.writeFileSync(
        this.paths.masterJsonPath,
        JSON.stringify(this.masterManifest)
      );
    } catch (err) {
      console.log('Unable to write master manifest file!!!', err);
    }
  }
};