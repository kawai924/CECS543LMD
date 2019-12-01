const { MASTER_MANIFEST_NAME, VSC_REPO_NAME, MANIFEST_DIR } = require(".");
const fs = require("fs");
const path = require("path");

/**
 * Check if a path is a directory
 * @param {String} sourcePath the parent directory
 * @param {String} fileName name of either a file / directory
 * @returns {Boolean} true if the path is a directory
 */
function isDir(sourcePath, fileName) {
  const filePath = path.join(sourcePath, fileName);
  return fs.statSync(filePath).isDirectory();
}

/**
 * Write a directory to disk
 * @param {String} path full path of a directory
 * @param {Object} options
 * @returns void
 */
function makeDirSync(path, options = { recursive: true }) {
  !fs.existsSync(path) && fs.mkdirSync(path, options);
}

/**
 * Create a queue
 * @returns a queue object
 */
function makeQueue() {
  let _data = [];

  const enqueue = element => {
    _data.unshift(element);
  };

  const dequeue = () => {
    return _data.shift();
  };

  const isEmpty = () => {
    return _data.length === 0;
  };

  const print = () => {
    console.log(_data);
  };

  return {
    enqueue,
    dequeue,
    isEmpty,
    print
  };
}

module.exports = {
  isDir,
  makeDirSync,
  makeQueue
};
