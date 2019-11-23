const fs = require("fs");
const path = require("path");

const InfoHandler = require("./InfoHandler");
const ManifestHandler = require("./ManifestHandler");
const DBHandler = require("./DBHandler");
const {
  copyFolderTreeWithMemoization,
  makeDirSync
} = require("./FolderFunctions");
const {
  VSC_REPO_NAME,
  MANIFEST_DIR,
  COMMANDS,
  MASTER_MANIFEST_NAME
} = require("../../constants");

module.exports = class RepoHandler {
  constructor(username, repoName, projectPath) {
    // Store all properties regarding about the current repo
    this.repo = {
      username,
      repoName,
      projectPath
    };

    // Add user into users.json
    DBHandler().addUser(username);
  }

  /* Utility functions
   *******************/
  create() {
    // Step 1: Set up manifests folder
    makeDirSync(path.join(this.repo.projectPath, VSC_REPO_NAME, MANIFEST_DIR));

    // Step 2: Writing new manifest
    // Create a new manifest handler
    const manifestHandler = this.getNewManifestHandler();
    // Add command to new manifest
    manifestHandler.addCommand(COMMANDS.CREATE);
    // manifestHandler.write() returns id and path of the newly created manifest.
    const { manifestID, manifestPath } = manifestHandler.write();

    // Step 3: Update info.json with new manifest file
    // Initialize and write info.json
    const infoHandler = this.getNewInfoHandler();
    // Write an default info.json first
    infoHandler.write();
    // Update the info.json with the new manifest
    infoHandler.addManifest(manifestID, manifestPath);

    // Step 4: Add project to users.json
    DBHandler().addProjectForUser(
      this.repo.username,
      this.repo.repoName,
      this.repo.projectPath
    );
  }

  addLabel(manifestID, label) {
    // Add label to info.json
    const infoHandler = this.getNewInfoHandler();
    infoHandler.addLabel(manifestID, label);
  }

  checkin() {
    // Step 1: Get the parent of this check-in.
    const infoHandler = this.getNewInfoHandler();
    const parentID = infoHandler.getCurrentHead();

    // Step 2: Writing a new manifest
    const manifestHandler = this.getNewManifestHandler();
    manifestHandler.addCommand(COMMANDS.CHECKIN);
    // Scan through project tree and update repo
    const folderStructure = copyFolderTreeWithMemoization(
      this.repo.projectPath,
      path.join(this.repo.projectPath, VSC_REPO_NAME)
    );
    // Add all artifacts path to the new manifest.
    manifestHandler.addStructure(folderStructure);
    // Write the manifest into the file system. Attach the parentID to that manifest
    const { manifestID, manifestPath } = manifestHandler.write(parentID);

    // Step 3: Update info.json with new manifest file
    infoHandler.addManifest(manifestID, manifestPath);
  }

  checkout(fromUsername, fromRepoName, sourceManifestID) {
    // Step 1: Preparing for repo system
    // Add project path to users.json
    DBHandler().addProjectForUser(
      this.repo.username,
      this.repo.repoName,
      this.repo.projectPath
    );
    // Make neccessary folders
    makeDirSync(path.join(this.repo.projectPath, VSC_REPO_NAME, MANIFEST_DIR));
    // Write a fresh info.json
    const infoHandler = this.getNewInfoHandler();
    infoHandler.write();

    // Step 2: Checkout files from source to target
    // Get the source repo path
    const sourceProjectPath = DBHandler().getProjectPath(
      fromUsername,
      fromRepoName
    );
    const pathToSourceRepo = path.join(
      DBHandler().getProjectPath(fromUsername, fromRepoName),
      VSC_REPO_NAME
    );
    // Grab source manifest using ID
    const manifestObject = this.getManifestObject(
      pathToSourceRepo,
      sourceManifestID
    );
    // Copy source file into the checkout folder
    manifestObject.structure.forEach(artifact =>
      this.checkoutArtifact(artifact, sourceProjectPath)
    );

    // Step 3: Write a new manifest
    const manifestHandler = this.getNewManifestHandler();
    manifestHandler.addCommand(COMMANDS.CHECKOUT);
    // Add all artifacts path to the new manifest.
    manifestHandler.addStructure(manifestObject.structure);
    manifestHandler.addCheckoutFrom(sourceProjectPath);
    // Write a new manifest into file with the parentID = manifestID from parameter
    const { manifestID, manifestPath } = manifestHandler.write(
      sourceManifestID
    );

    // Step 4: Update the info.json with the new manifest
    infoHandler.addManifest(manifestID, manifestPath);
  }

  /* Helper functions
   *******************/
  getManifestObject(pathToSourceRepo, manifestID) {
    const sourceRepoInfoObject = JSON.parse(
      fs.readFileSync(path.join(pathToSourceRepo, MASTER_MANIFEST_NAME))
    );

    const manifestList = sourceRepoInfoObject.manifests;

    // Check if manifestID is a label

    // Looping through the manifest array to find matching manifest using ID.
    for (let i = 0; i < manifestList.length; i++) {
      if (manifestList[i].manifestID == manifestID) {
        const manifestPath = manifestList[i].manifestPath;
        return JSON.parse(fs.readFileSync(manifestPath));
      }
    }

    throw new Error("Can't get master manifest file");
  }

  isLabelPresent(masterManifestObj, labelName) {}

  getNewManifestHandler() {
    return new ManifestHandler(
      this.repo.username,
      this.repo.repoName,
      path.join(this.repo.projectPath, VSC_REPO_NAME, MANIFEST_DIR)
    );
  }

  getNewInfoHandler() {
    return new InfoHandler(
      this.repo.username,
      this.repo.repoName,
      path.join(this.repo.projectPath, VSC_REPO_NAME)
    );
  }

  getHeadManifestID() {
    return this.getNewInfoHandler().getCurrentHead();
  }

  checkoutArtifact(artifact, sourceProjectPath) {
    // const escapedFileName = this.escapeRegExp(artifact.artifactNode);

    // Append the folder path with the new target path
    const newDestPath = path.join(
      this.repo.projectPath,
      artifact.artifactRelPath
        .split("/")
        .slice(2) // exclude "" and repo folder name
        .join("/")
    );

    // Recursively make folders in the destination
    fs.mkdirSync(newDestPath, { recursive: true });

    // Regrex to get the filename from leaf folder
    const regrexForFileName = /.+(?=\/)/;
    // If no match, return null
    const fileNameMatches = regrexForFileName.exec(artifact.artifactNode);

    // If there is a file in the repo folder
    if (fileNameMatches) {
      // Grab fileName from regrex
      const fileName = fileNameMatches[0];

      // Get full file path from source
      const fileSource = path.join(
        sourceProjectPath,
        artifact.artifactRelPath,
        artifact.artifactNode
      );

      // Create the folder
      makeDirSync(newDestPath);

      // Copy the file
      fs.copyFileSync(fileSource, path.join(newDestPath, fileName));
    }
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }
};
