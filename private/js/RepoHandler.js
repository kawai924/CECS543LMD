const fs = require("fs");
const path = require("path");
const InfoHandler = require("./InfoHandler");
const ManifestHandler = require("./ManifestHandler");
const { copyFolderTreeWithMemoization, makeDir } = require("./FolderFunctions");
const ROOTPATH = path.join(__dirname, "..", "..");

/* RepoHandler handles all methods regarding repos. */
module.exports = class RepoHandler {
  constructor(username, repoName, projectPath) {
    console.log("(RH) projectPath=" + projectPath);

    // Store all properties regarding about the current repo
    this.repo = {
      username,
      repoName,
      projectPath
    };

    // Create a new manifest handler
    this.manifestHandler = new ManifestHandler(
      username,
      repoName,
      path.join(projectPath, "repo", "manifests")
    );

    // Initialize and write info.json
    this.infoHandler = new InfoHandler(
      username,
      repoName,
      path.join(projectPath, "repo")
    );

    // Command enumerations
    this.command = {
      CREATE: "create",
      CHECKIN: "check-in",
      CHECKOUT: "check-out",
      MERGE: "merge"
    };
  }

  /* Create Functionality */
  create() {
    // Add command to new manifest
    this.manifestHandler.addCommand(this.command.CREATE);

    // Calling manifestHandler write() to write the manifest into the system, it returns id and path of the newly created manifest.
    const { manifestID, manifestPath } = this.manifestHandler.write();

    // Update the info.json with the new manifest
    this.infoHandler.addManifest(manifestID, manifestPath);
  }

  /* Label Functionality */
  addLabel(manifestID, label) {
    this.infoHandler.addLabel(manifestID, label);
  }

  /* Checkout Functionality */
  checkout(fromUser, fromRepoName, manifestID) {
    const pathToSourceRepo = path.join(
      ROOTPATH,
      "database",
      fromUser,
      fromRepoName,
      "repo"
    );

    console.log("(check-out) pathToSourceRepo=" + pathToSourceRepo);
    console.log(
      "(check-out) this.infoHanlder=" + JSON.stringify(this.infoHandler)
    );

    // Add command to new manifest
    this.manifestHandler.addCommand(this.command.CHECKOUT);

    // Grab the manifest from source repo info.json
    const manifestObject = this.getManifestObject(pathToSourceRepo, manifestID);

    console.log("(check-out) manifestObject=" + JSON.stringify(manifestObject));

    // Copy source file into the checkout folder
    manifestObject.structure.forEach(item => {
      const escapedFileName = item.artifactNode
        .replace(".", "\\.")
        .replace("/", "\\/");

      // Build a regrex
      const relativeArtifactPathRegrex = new RegExp(
        `(?<=${fromRepoName}).*(?=${escapedFileName})?`
      );

      const relativeArtifactPath = relativeArtifactPathRegrex.exec(
        item.artifactAbsPath
      );

      // If folder is empty, get an empty string
      const relativeDestPath = relativeArtifactPath
        ? relativeArtifactPath[0]
        : "";

      // Append the folder path with the new target path
      const newDestPath = path.join(this.repo.projectPath, relativeDestPath);
      // Recursively make folders in the destination
      makeDir(newDestPath);

      // Regrex to get the filename from leaf folder
      const regrexForFileName = /.+(?=\/)/;
      // If no match, return null
      const fileNameMatches = regrexForFileName.exec(item.artifactNode);

      // If there is a file in the repo folder
      if (fileNameMatches) {
        // Grab fileName from regrex
        const fileName = fileNameMatches[0];

        // Get full file path from source
        const fileSource = path.join(item.artifactAbsPath, item.artifactNode);

        // Create full file path to destination
        // const fileDest = path.join(newDestPath, fileName);
        const fileDest = path.join(this.repo.projectPath, relativeDestPath);

        // Create the folder
        makeDir(fileDest);

        // Copy the file
        fs.copyFileSync(fileSource, path.join(fileDest, fileName));
      }
    });

    // Copy the structure that uses to checkout
    this.manifestHandler.addStructure(structure);

    // Write a new manifest into file with the parentID = manifestID from parameter
    this.manifestHandler.write(manifestID);
  }

  /* Check In */
  checkin() {
    const parentID = this.infoHandler.getCurrentHead();

    // Add command to manifest handler
    this.manifestHandler.addCommand(this.command.CHECKIN);

    const folderStructure = copyFolderTreeWithMemoization(
      this.repo.projectPath,
      path.join(this.repo.projectPath, "repo")
    );

    this.manifestHandler.addStructure(folderStructure);

    const { manifestID, manifestPath } = this.manifestHandler.write(parentID);

    // Update the info.json with the new manifest
    this.infoHandler.addManifest(manifestID, manifestPath);
  }

  // Helper function
  getManifestObject(pathToSourceRepo, manifestID) {
    const sourceRepoInfoObject = JSON.parse(
      fs.readFileSync(path.join(pathToSourceRepo, "info.json"))
    );

    const manifestList = sourceRepoInfoObject.manifests;

    console.log(
      "(getManifestObject), manifestList=" + JSON.stringify(manifestList)
    );

    let manifestPath;
    for (let i = 0; i < manifestList.length; i++) {
      console.log(
        "(getManifestObject), manifestList[i].manifestID=" +
          manifestList[i].manifestID +
          ", manifestID=" +
          manifestID
      );
      if (manifestList[i].manifestID === manifestID) {
        manifestPath = manifestList[i].manifestPath;
      }
    }

    console.log("(getManifestObject), manifestPath=" + manifestPath);

    return JSON.parse(fs.readFileSync(manifestPath));
  }
};
