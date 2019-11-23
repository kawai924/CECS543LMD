const fs = require("fs");
const path = require("path");
const { makeDirSync } = require("./FolderFunctions");
const { MANIFEST_DIR } = require("./../../constants");

module.exports = class ManifestHandler {
  constructor(userName, repoName, manifestFolderPath, parent = null) {
    // console.log("(MH) manifestFolderPath=" + manifestFolderPath);

    this.manifestFolderPath = manifestFolderPath;

    // Store information about upcoming manifest
    this.newManifest = {
      user: userName,
      repo: repoName,
      structure: [],
      parent
    };
  }

  /* Setters */
  addCommand(command) {
    this.newManifest.command = command;
  }

  addCheckoutFrom(fromPath) {
    this.newManifest.checkoutFromPath = fromPath;
  }

  // Add parents to the manifest file
  addParent(...parents) {
    if (parents.length > 2) {
      throw new Error("Too many parents...");
    }

    parents.forEach(parent => {
      this.newManifest.parent.push(parent);
    });
  }

  addStructure(folderStructure) {
    this.newManifest.structure = folderStructure;
  }

  // addLabel(manifestID, label) {
  //   this.masterManifest.labels.push({ [label]: manifestID });

  //   // Update the master manifest
  //   this.rewriteMasterManifest();
  // }

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

  /* Write manifest into file */
  write(parentID = null) {
    if (parentID !== null) {
      this.newManifest.parent = [];
      this.newManifest.parent.push(parentID);
    }
    this.newManifest.datetime = new Date();
    this.newManifest.id = this.newManifest.datetime.getTime();

    const manifestName = this.newManifest.id.toString() + ".json";
    const manifestPath = path.join(this.manifestFolderPath, manifestName);
    try {
      // Write manifest file into the manifest folder
      fs.writeFileSync(manifestPath, JSON.stringify(this.newManifest));
    } catch (err) {
      console.log("Unable to write manifest file!!!", err);
    }

    return {
      manifestID: this.newManifest.id,
      manifestPath: manifestPath
    };
  }

  /* Helper functions */
  /* Grab master manifest */
  getMasterManifest() {
    // Create repo folder under database/[userName]/[repoName]
    makeDirSync(this.paths.writeToPath, { recursive: true });

    // Create folder named "manifests" with path: database/[userName]/[repoName]/manifests
    makeDirSync(path.join(this.paths.writeToPath, MANIFEST_DIR), {
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
          "Unable to write master manifest file into alternate path!!!",
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
      console.log("Unable to write master manifest file!!!", err);
    }
  }
};
