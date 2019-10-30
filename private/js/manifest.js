/**
 * Create a manifest object and write it into a json file
 * in the repo folder.
 *
 * ROOT: databae/username/reponame/
 *
 * General form of manifest object
 *  - id: store id of this manifest
 *  - command: store the command attached with this manifest
 *  - user: user name
 *  - repo: repo name
 *  - date: date and time of the command
 *  - structure: an array of objects, each contains
 *      "[leaf folder]/artifact" : absolute path to the artifact
 *
 * Ex: The structure for path: /liam/foo/bar.txt/artifact1.txt
 * "bar.txt/artifact1.txt" : "/liam/foo/bar.txt/artifact1.txt"
 *
 * Ex: The structure for path: /liam/foo/baz/bar.txt/artifact3.txt
 * "bar.txt/artifact1.txt" : "/liam/foo/bar.txt/artifact1.txt"
 *
 *
 * For master_manifest.json
 * General Form:
 *  "manifest_lists": {
 *      "id1" : "manifest path"
 *      "id2" : "manifest path"
 *          ...
 *  }
 *  labels: {} // contains all labels mapping to a particular manifest

 * 
 * With: 
 *  - id: auto increment. Higher number = newer manifest.
 *  - manifest path: the path to each manifest of this repo.
 
 */
const fs = require("fs");
const path = require("path");
const util = require("util");
const ff = require("./FolderFunctions");
const constants = require("../../server/constants");
const readFilePromise = util.promisify(fs.readFile); // Turn fs.readFile into a promise

class Manifest {
  constructor({ userName, repoName, destRepoPath }) {
    this.paths = {
      destRepoPath,
      masterJsonPath: path.join(destRepoPath, "master_manifest.json")
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
    const masterManifest = this.getMasterManifest();
    masterManifest.labels[label] = manifestID;

    // Update the master manifest
    try {
      fs.writeFileSync(
        this.paths.masterJsonPath,
        JSON.stringify(masterManifest)
      );
    } catch (err) {
      console.log(err);
    }
  }

  /* Getter */
  getManifestPath(id) {
    return this.masterManifest.manifest_lists[id.toString()] || false;
  }

  /* Write manifest into file and update master manifest */
  write() {
    const newID =
      Object.keys(this.masterManifest.manifest_lists).length + 1 || 1;
    this.newManifest.id = newID;
    this.newManifest.datetime = new Date();

    const manifestName = "manifest_" + newID.toString() + ".json";
    const newManifestPath = path.join(
      this.paths.destRepoPath,
      "manifests",
      manifestName
    );

    try {
      // Write manifest file into the manifest folder
      fs.writeFileSync(newManifestPath, JSON.stringify(this.newManifest));
    } catch (err) {
      console.log("Unable to write manifest file!!!", err);
    }

    // Update the master manifest
    this.masterManifest.manifest_lists[newID] = newManifestPath;
    try {
      fs.writeFileSync(
        this.paths.masterJsonPath,
        JSON.stringify(this.masterManifest)
      );
    } catch (err) {
      console.log("Unable to write master manifest file!!!", err);
    }
  }

  /* Helper functions */
  getMasterManifest() {
    // Create repo folder under database/[userName]/[repoName]
    ff.makeDir(this.paths.destRepoPath, { recursive: true });
    // Create folder named "manifests" with path: database/[userName]/[repoName]/manifests
    ff.makeDir(path.join(this.paths.destRepoPath, "manifests"), {
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
}

module.exports = Manifest;
