const fs = require('fs');
const path = require('path');

const Queue = require('./Queue');
const createArtifactId = require('./Artifact');

/* This function reads each file from source folder, create artifact id and copy to target folder */
function copyFolderTreeWithMemoization(sourcePath, targetFolder) {
  let structure = [];

  function copyFolderTree(sourcePath, targetFolder) {
    let fileQueue = new Queue(); //Queue to hold files

    //Add all files to a queue
    const allFiles = fs.readdirSync(sourcePath);
    for (let file of allFiles) {
      fileQueue.enqueue(file);
    }

    //Process each element in the queue
    while (!fileQueue.isEmpty()) {
      const fileName = fileQueue.dequeue();

      //Check if fileName is a DOT FILE (ex: .DS_STORE), ignore
      if (!/^(?!\.).*$/.test(fileName)) continue;

      // The current file is a DIRECTORY
      if (isDirectory(sourcePath, fileName)) {
        const dirPath = path.join(sourcePath, fileName);
        const newTarget = path.join(targetFolder, fileName);

        // Create the directory in the destination
        makeDir(newTarget);

        // Add """" : dirPath to structure
        structure.push({ artifactNode: '', artifactAbsPath: newTarget });

        //Recursively copy sub folders and files.
        copyFolderTree(dirPath, newTarget);
      } else {
        // The current file is a FILE
        // Grab the full path of leaf folder
        const leafFolder = path.join(targetFolder, fileName);

        // Create the folder there
        makeDir(leafFolder);

        //Create artifact for the file
        const filePath = path.join(sourcePath, fileName);
        const artifact = createArtifactId(filePath);

        //Move the file with artifact name
        const artifactFullPath = path.join(leafFolder, artifact);
        fs.copyFile(filePath, artifactFullPath, err => {
          if (err) throw err;
        });

        // Grab the absolute path from database to the curent artifact
        const fileNameWithoutExtension = /.*(?=\.)/.exec(
          fileName.split('/').pop()
        )[0];
        const regrex = new RegExp(`.*(?=${fileNameWithoutExtension})`);
        const fullArtifactPath = regrex.exec(artifactFullPath)[0];

        // Add artifact and its path to manifest
        structure.push({
          artifactNode: path.join(fileName, artifact),
          artifactAbsPath: fullArtifactPath
        });
      }
    }
  }
  copyFolderTree(sourcePath, targetFolder);
  return structure;
}

/**
 * Check if a file from a source is a directory
 */
function isDirectory(source, fileName) {
  const filePath = path.join(source, fileName);
  return fs.statSync(filePath).isDirectory();
}

/* Function to create a directory if directory is not exists */
function makeDir(path, options = { recursive: true }) {
  !fs.existsSync(path) && fs.mkdirSync(path, options);
}

module.exports = {
  copyFolderTreeWithMemoization,
  isDirectory,
  makeDir
};
