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
  checkout(manifestID, destPath) {
    const { username, repoName } = this.repo;

    // Add command to new manifest
    this.manifestHandler.addCommand("checkout");

    const manifestPath = this.manifestHandler.getManifestPath(manifestID);

    // Grab structure from parsed manifest file
    const { structure } = JSON.parse(fs.readFileSync(manifestPath));

    // Copy source file into the checkout folder
    structure.forEach(item => {
      // Use regrex to grab the path of the folder after /database
      const escapedFileName = item.artifactNode
        .replace(".", "\\.")
        .replace("/", "\\/");
      const folderRegrex = new RegExp(
        `(?<=${username}).*(?=${escapedFileName})?`
      );

      const pathString = folderRegrex.exec(item.artifactAbsPath);
      const relativeDestPath = pathString ? pathString[0] : "";

      // Append the folder path with the new target path
      const newDestPath = path.join(destPath, relativeDestPath);
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
        const fileDest = path.join(destPath, relativeDestPath);
        if (!fs.existsSync(fileDest)) {
          fs.mkdirSync(fileDest, { recursive: true });
        }

        // Copy the file
        fs.copyFileSync(fileSource, fileDest + fileName);
      }
    });

    // HANDLE manifest for the original repo
    // Copy the structure that uses to checkout
    this.manifestHandler.addStructure(structure);
    // Write a new manifest into file.
    this.manifestHandler.write({ checkoutPath: destPath });

    // Create a new manifest handler
    const repoManifest = new Manifest({
      username,
      repoName,
      destRepoPath: path.join(destPath, repoName)
    });
    // Write master manifest
    repoManifest.rewriteMasterManifest(path.join(destPath, repoName));
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
    this.manifestHandler.write(parentID);
  }
};
