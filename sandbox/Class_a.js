"use strict";
const fs = require("fs");
const constants = require("../server/constants");
const path = require("path");

const filePath = path.join(
  constants.ROOTPATH,
  "database",
  "liam",
  "Test_user",
  "master_manifest.jsodfadsfn"
);

function doesFileExists(filePath) {
  return fs.existsSync(filePath) ? true : false;
}

console.log(doesFileExists(filePath));
