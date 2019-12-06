/*
 * This file stores functions that doesn't fit to any class.
 * Authors: Liam Nguyen | Matt Nguyen | Marco Curci | Dennis Lo
 * Contacts: nguyen.dch@gmail.com | matthewnguyen19@gmail.com | marco.curci@student.csulb.edu | dennis.lo@student.csulb.edu
 * LMD VSC Control - CECS 543 - Fall 2019
 */

const fs = require('fs');
const path = require('path');

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
