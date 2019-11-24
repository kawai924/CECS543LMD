const {
  fs,
  path,
  VSC_REPO_NAME,
  MANIFEST_DIR,
  COMMANDS,
  MASTER_MANIFEST_NAME
} = require("./");

const InfoHandler = require("./InfoHandler");
const ManifestHandler = require("./ManifestHandler");
const DBHandler = require("./DBHandler");
const { copyDirTree, makeDirSync } = require("./Functions");

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
    const manifestHandler = this.createManifestHandler();
    // Add command to new manifest
    manifestHandler.addCommand(COMMANDS.CREATE);
    // manifestHandler.write() returns id and path of the newly created manifest.
    const { manifestID, manifestPath } = manifestHandler.write();

    // Step 3: Update info.json with new manifest file
    // Initialize and write info.json
    const infoHandler = this.createInfoHandler();
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
    const infoHandler = this.createInfoHandler();
    infoHandler.addLabel(manifestID, label);
  }

  checkin() {
    // Step 1: Get the parent of this check-in.
    const infoHandler = this.createInfoHandler();
    const parentID = infoHandler.getCurrentHead();

    // Step 2: Writing a new manifest
    const manifestHandler = this.createManifestHandler();
    manifestHandler.addCommand(COMMANDS.CHECKIN);
    // Scan through project tree and update repo
    const folderStructure = copyDirTree(
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
    const infoHandler = this.createInfoHandler();
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
    const manifestHandler = this.createManifestHandler();
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

    // Retrieve manifest ID from label. If exits, set that to manifestID
    const result = this.retrieveIDFromLabel(sourceRepoInfoObject, manifestID);
    if (result) {
      manifestID = result;
    }

    // Find manifest with the ID
    for (let i = 0; i < manifestList.length; i++) {
      if (manifestList[i].manifestID == manifestID) {
        const manifestPath = manifestList[i].manifestPath;
        return JSON.parse(fs.readFileSync(manifestPath));
      }
    }

    throw new Error("Can't get master manifest file");
  }

  retrieveIDFromLabel(masterManifestObj, labelName) {
    const labelList = masterManifestObj.labels;

    for (let i = 0; i < labelList.length; i++) {
      const labelObj = labelList[i];
      const [currentLabelName] = Object.keys(labelObj);

      if (currentLabelName === labelName) {
        return labelObj[currentLabelName];
      }
    }

    return null;
  }

  createManifestHandler() {
    return new ManifestHandler(
      this.repo.username,
      this.repo.repoName,
      path.join(this.repo.projectPath, VSC_REPO_NAME, MANIFEST_DIR)
    );
  }

  createInfoHandler() {
    return new InfoHandler(
      this.repo.username,
      this.repo.repoName,
      path.join(this.repo.projectPath, VSC_REPO_NAME)
    );
  }

  getHeadManifestID() {
    return this.createInfoHandler().getCurrentHead();
  }

  checkoutArtifact(artifact, sourceProjectPath) {
    // Append the folder path with the new target path
    const newDestPath = path.join(
      this.repo.projectPath,
      path.relative(VSC_REPO_NAME, artifact.artifactRelPath)
    );

    // Recursively make folders in the destination
    fs.mkdirSync(newDestPath, { recursive: true });

    // Get full file path from source
    const fileSource = path.join(
      sourceProjectPath,
      artifact.artifactRelPath,
      artifact.artifactNode
    );

    // Create the folder
    makeDirSync(newDestPath);

    // Copy the file
    const fileName = path.basename(artifact.artifactNode);
    fs.copyFileSync(fileSource, path.join(newDestPath, fileName));
  }

  // Duplicates two files into a given target directory
  // rPath = absolute path of repo path
  // gPath = absolute path of grandma path
  // targetPath = absolute path of intended target directory
  moveFiles(rPath, gPath, targetPath) {
    let rPathDest = path.join(targetPath, path.basename(rPath));
    let gPathDest = path.join(targetPath, path.basename(gPath));
    let extensionR = path.extname(rPath);
    let extensionG = path.extname(gPath);

    // Duplicate rPath to targetPath
    fs.copyFile(rPath, rPathDest, err => {
      if (err) throw err;
      console.log(path.basename(rPath), " copied to ", rPathDest);
    });

    // Duplicate gPath to targetPath
    fs.copyFile(gPath, gPathDest, err => {
      if (err) throw err;
      console.log(path.basename(gPath), " copied to ", gPathDest);
    });

    // Append _mr or _mg to the duplicated filenames
    fs.renameSync(
      rPathDest,
      path.join(rPathDest.replace(/\.[^/.]+$/, "") + "_mr" + extensionR)
    );
    fs.renameSync(
      gPathDest,
      path.join(gPathDest.replace(/\.[^/.]+$/, "") + "_mg" + extensionG)
    );
  }
};
