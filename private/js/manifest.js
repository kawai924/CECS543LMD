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
 *  - structure:
 *       + "[leaf folder]/artifact" : absolute path to the artifact
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
const constants = require("../../server/constants");

// Turn fs.readFile into a promise
const readFilePromise = util.promisify(fs.readFile);

class Manifest {
  constructor(command, destRepoPath) {
    this.destRepoPath = destRepoPath;
    this.command = command;
    this.masterManifest = {};
    this.newManifest = {};

    // Path of the upcoming master_manifest.json (not check if exists)
    this.masterJsonPath = path.join(this.destRepoPath, "master_manifest.json");
  }

  // Grab or create the master_manifest.json
  initialize() {
    this.masterManifest = this.getMasterManifest(); // grab master manifest

    // Prepare new id for a new manifest file
    this.newID = Object.keys(this.masterManifest.manifest_lists).length + 1;

    // Create a template for a new manifest
    // Path pattern: database/[userName]/[repoName]
    const deconstructedPathToRepo = this.destRepoPath.split("/"); // Split the path
    const len = deconstructedPathToRepo.length;
    const userName = deconstructedPathToRepo[len - 2]; // Next to last
    const repoName = deconstructedPathToRepo[len - 1]; // Last element
    const datetime = new Date();

    this.newManifest = {
      id: this.newID,
      user: userName,
      repo: repoName,
      command: this.command,
      datetime: datetime,
      structure: {}
    };
  }

  // Add a label of a particular manifest to master manifest
  addLabel(manifestID, label) {
    const masterManifest = this.getMasterManifest();
    console.log("before", masterManifest);
    masterManifest.labels[label] = manifestID;
    console.log("after", masterManifest);

    // Update the master manifest
    try {
      fs.writeFileSync(this.masterJsonPath, JSON.stringify(masterManifest));
    } catch (err) {
      console.log(err);
    }
  }

  // Store artifact path and relative location into this.manifest object
  // Artifact path: [leaf_folder]/[artifact_file]
  // Relative path: from rootRepo => Look above for reference
  addToStructure(artifactPath, relPath) {
    const structureObj = this.newManifest.structure;
    structureObj[artifactPath] = relPath;
  }

  finalize() {
    // Write manifest file into the manifest folder
    const manifestName = "manifest_" + this.newID.toString() + ".json";
    const newManifestPath = path.join(
      this.destRepoPath,
      "manifests",
      manifestName
    );
    try {
      fs.writeFileSync(newManifestPath, JSON.stringify(this.newManifest));
    } catch (err) {
      console.log(err);
    }

    // Update the master manifest
    this.masterManifest.manifest_lists[this.newID] = newManifestPath;
    try {
      fs.writeFileSync(
        this.masterJsonPath,
        JSON.stringify(this.masterManifest)
      );
    } catch (err) {
      console.log(err);
    }
  }

  /* Helper functions */
  getMasterManifest() {
    // Check if master_manifest.json exists
    const isMasterExist = fs.existsSync(this.masterJsonPath);

    // If master manifest doesn't exist, make one!
    if (!isMasterExist) {
      const newMasterManifest = { manifest_lists: {}, labels: {} };
      // Write to file master_manifest.json with {}
      fs.writeFileSync(this.masterJsonPath, JSON.stringify(newMasterManifest));
    }

    // Grab the master_manifest.json file
    const rawMasterManifest = fs.readFileSync(
      path.join(this.destRepoPath, "master_manifest.json")
    );

    // rawMasterManifest is currently a buffer. So, toString() converts it into a string
    // then JSON converts string into object
    // store that in the manifest object
    return JSON.parse(rawMasterManifest.toString());
  }
}

module.exports = Manifest;
