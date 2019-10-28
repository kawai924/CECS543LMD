/**
 * This file contains functions that manipulate folders and folders' structure.
 */
const fs = require("fs");
const path = require("path");

const createArtifactId = require("./Artifact");
const Manifest = require("./Manifest");
const { Queue } = require("./Queue");

/**
 * Read all files in a particular source and put it in a queue
 * @param source the original path.
 * @param targetFolder the target folder where the folder tree is replicated into.
 */
function copyFolderTree(source, targetFolder, ManifestObj) {
  let fileQueue = new Queue(); //Queue to hold files

  //Add all files to a queue
  const allFiles = fs.readdirSync(source);
  for (let file of allFiles) {
    fileQueue.enqueue(file);
  }

  //Process each element in the queue
  while (!fileQueue.isEmpty()) {
    const fileName = fileQueue.dequeue();

    // let date_ob = new Date();

    // The current file is a DIRECTORY
    if (isDirectory(source, fileName)) {
      const dirPath = path.join(source, fileName);
      const newTarget = path.join(targetFolder, fileName);

      makeDir(newTarget); //Make a directory

      ManifestObj.addToStructure("", newTarget); // Add """" : dirPath to structure

      copyFolderTree(dirPath, newTarget, ManifestObj); //Recursively copy sub folders and files.

      // The current file is a FILE
    } else {
      const leafFolder = path.join(targetFolder, fileName);
      makeDir(leafFolder);

      //Create artifact for file name
      const filePath = path.join(source, fileName);
      const artifact = createArtifactId(filePath);

      // //write manifest file
      // const content =
      //   "Project Name: " +
      //   fileName +
      //   ". Created Date: " +
      //   date_ob +
      //   "\r\n---------------------------\r\nFile Name: " +
      //   fileName +
      //   ". Artifact ID: " +
      //   artifact +
      //   "\r\n";
      // //Create manifest file
      // fs.writeFile(leafFolder + "/manifest.txt", content, err => {
      //   if (err) {
      //     console.error(err);
      //     return;
      //   }
      //   //file written successfully
      //   // console.log('Saved manifest');
      // });

      //Move the file with artifact name
      const artifactPath = path.join(leafFolder, artifact);
      fs.copyFile(filePath, artifactPath, err => {
        if (err) throw err;
      });

      // Grab the absolute path from database to the curent artifact
      const testingArtifactPath = /.*\/database\//.exec(artifactPath);
      const leafFolderPathArray = leafFolder.split("/");
      const leafFolderName =
        leafFolderPathArray[leafFolderPathArray.length - 1];

      ManifestObj.addToStructure(
        path.join(leafFolderName, artifact),
        testingArtifactPath[0]
      );
    }
  }
}

/**
 * Check if a file from a source is a directory
 * @param source  the path of the file
 * @param fileName the name of the file
 * Return: boolean
 */
function isDirectory(source, fileName) {
  const filePath = path.join(source, fileName);
  return fs.statSync(filePath).isDirectory();
}

/**
 * If a directory is not exists, create a new one. Otherwise, do nothing
 * @param path the path of the new folder
 */
function makeDir(path, options = {}) {
  !fs.existsSync(path) && fs.mkdirSync(path, options);
}

module.exports = {
  copyFolderTree,
  isDirectory,
  makeDir
};
