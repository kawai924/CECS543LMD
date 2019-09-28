/**
 * This file contains functions that manipulate folders and folders' structure.
 */

const fs = require('fs');
const path = require('path');
const createArtifactId = require('./artifact');
const {Queue} = require('./queue');

/**
 * Read all files in a particular source and put it in a queue
 * @param source the original path.
 * @param targetFolder the target folder where the folder tree is replicated into.
 */
function copyFolderTree(source, targetFolder) {
    //Queue to hold files
    let fileQueue = new Queue();

    //Add all files to a queue
    const allFiles = fs.readdirSync(source);
    for (let file of allFiles) {
        fileQueue.enqueue(file);
    }

    //Process each element in the queue
    while(!fileQueue.isEmpty()) {
        
        const fileName = fileQueue.dequeue();
        // new Date object
        let date_ob = new Date();

        if (isDirectory(source, fileName)) {
            const newSource = path.join(source, fileName);
            const newTarget = path.join(targetFolder, fileName);
            //Make a directory
            makeDir(newTarget);
            
            //Recursively copy sub folders and files.
            copyFolderTree(newSource, newTarget);
        } else {
            //console.log("TARGET " + targetFolder + ", fileName " + fileName);
            const leafFolder = path.join(targetFolder, fileName);
            //console.log('LEAF FOLDER ' + leafFolder);
            makeDir(leafFolder);
            
            //Create artifact for file name
            const filePath = path.join(source, fileName);
            const artifact = createArtifactId(filePath);
            
            //write manifest file
            const content = 'Project Name: ' + fileName + '. Created Date: '+ date_ob+'\r\n---------------------------\r\nFile Name: ' + fileName+'. Artifact ID: '+artifact+'\r\n';
            //console.log(content);
            //Create manifest file
            fs.writeFile(leafFolder+'/manifest.txt', content, (err) => {
                if (err) {
                  console.error(err)
                  return
                }
                //file written successfully
                console.log('Saved manifest');
            })
            

            //Move the file with artifact name
            const artifactPath= path.join(leafFolder, artifact);
            fs.copyFile(filePath, artifactPath , (err) => {
                if (err) throw err;
            })
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
function makeDir(path) {
    !fs.existsSync(path) && fs.mkdirSync(path);

}

module.exports = {
    copyFolderTree,
    isDirectory,
    makeDir
};