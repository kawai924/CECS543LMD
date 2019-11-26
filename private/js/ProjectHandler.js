const {
  DB_PATH,
  MANIFEST_DIR,
  VSC_REPO_NAME,
  MASTER_MANIFEST_NAME,
  COMMANDS
} = require("./");
const path = require("path");
const fs = require("fs");
const { copyDirTree, makeDirSync } = require("./Functions");

const { ManifestWriter, ManifestReader } = require("./Manifest");
const { MasterManWriter, MasterManReader } = require("./Master");

class ProjectHandler {
  constructor(username) {
    this.username = username;
  }

  forProject(projectName) {
    this.projectName = projectName;
    this.projectPath = path.join(DB_PATH, this.username, projectName);
    this.repoPath = path.join(this.projectPath, VSC_REPO_NAME);
    this.manDirPath = path.join(this.repoPath, MANIFEST_DIR);
    return this;
  }

  create() {
    // Step 1: Create all neccessary folder
    fs.mkdirSync(path.join(this.repoPath, MANIFEST_DIR), { recursive: true });

    // Step 2: Get handlers
    const manWriter = new ManifestWriter(this.username, this.projectName);
    const masManWriter = new MasterManWriter(this.username, this.projectName);

    // Step 3: Build and write a manifest
    const newMan = manWriter
      .addCommand(COMMANDS.CREATE)
      .addStructure()
      .write();

    // Step 4: Add new manifest to master manifest
    masManWriter.writeFreshMasMan();
    masManWriter.addNewMan(newMan);
  }

  label(manID, label) {
    const masManWriter = new MasterManWriter(this.username, this.projectName);
    masManWriter.addLabel(manID, label);
  }

  checkin(fromPath) {
    fromPath = fromPath || this.projectPath;

    // Step 2: Get handlers
    const manWriter = new ManifestWriter(this.username, this.projectName);
    const masManWriter = new MasterManWriter(this.username, this.projectName);
    const masManReader = new MasterManReader(this.username, this.projectName);

    // Step 3: Get artifacts
    const artifactsList = copyDirTree(fromPath, this.repoPath);

    // Step 5: Get head
    const head = masManReader.getHead();

    // Step 4: Write manifest
    const newMan = manWriter
      .addCommand(COMMANDS.CHECKIN)
      .addParent(head)
      .addStructure(artifactsList)
      .write();

    // Step 5: Update master manifest
    masManWriter.addNewMan(newMan);
  }

  checkout(sUsername, sProject, sID) {
    // Step 1: Create all neccessary folder
    fs.mkdirSync(this.manDirPath, { recursive: true });

    // Step 2: Get handlers
    const tManWriter = new ManifestWriter(this.username, this.projectName);
    const sManReader = new ManifestReader(sUsername, sProject);
    const tManReader = new ManifestReader(this.username, this.projectName);
    const tMasManWriter = new MasterManWriter(this.username, this.projectName);

    // Step 3: Checkout files
    const sMan = sManReader.getMan(sID);
    const sProjectPath = path.join(DB_PATH, sUsername, sProject);
    const sArtifactList = sMan.structure || [];

    sArtifactList.forEach(artifact =>
      this._checkoutArtifact(artifact, sProjectPath)
    );

    // Step 3: Build and write a manifest
    const sPath = path.join(DB_PATH, sUsername, sProject);
    const newMan = tManWriter
      .addCommand(COMMANDS.CHECKOUT)
      .addCheckoutFrom(sPath)
      .addParent(sID)
      .addStructure(sMan.structure)
      .write();

    // Step 4: Add new manifest to master manifest
    tMasManWriter.addNewMan(newMan);
  }

  _checkoutArtifact(artifact, sProjectPath) {
    if (artifact.artifactNode == "") {
      return;
    }
    // Append the folder path with the new target path
    const newDestPath = path.join(
      this.projectPath,
      path.relative(VSC_REPO_NAME, artifact.artifactRelPath)
    );

    // Recursively make folders in the destination
    fs.mkdirSync(newDestPath, { recursive: true });

    // Get full file path from source
    const fileSource = path.join(
      sProjectPath,
      artifact.artifactRelPath,
      artifact.artifactNode
    );

    // Create the folder
    makeDirSync(newDestPath);

    // Copy the file
    const fileName = artifact.artifactNode.split(path.sep)[0];

    fs.copyFileSync(fileSource, path.join(newDestPath, fileName));
  }

  // Duplicates two files into a given target directory
  // rPath = absolute path of repo path
  // gPath = absolute path of grandma path
  // targetPath = absolute path of intended target directory
  _mergeOutMoveFiles(rPath, gPath, targetPath) {
    let rPathDest = path.join(targetPath, path.basename(rPath));
    let gPathDest = path.join(targetPath, path.basename(gPath));
    let extensionR = path.extname(rPath);
    let extensionG = path.extname(gPath);

    // Duplicate rPath to targetPath
    fs.copyFile(rPath, rPathDest, err => {
      if (err) throw err;
      // console.log(path.basename(rPath), " copied to ", rPathDest);
    });

    // Duplicate gPath to targetPath
    fs.copyFile(gPath, gPathDest, err => {
      if (err) throw err;
      // console.log(path.basename(gPath), " copied to ", gPathDest);
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
}

module.exports = {
  ProjectHandler
};
