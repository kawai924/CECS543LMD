"use strict";
const fs = require("fs");
const constants = require("../server/constants");
const path = require("path");
const ff = require("../private/js/FolderFunctions");

const masterManifest = {
  manifest_lists: {
    "1":
      "/Users/chinhnguyen/Dropbox/School/CSULB/Master/Fall 2019/543/Project 1/Project/CECS543LMD/database/liam/Test_user/manifests/manifest_1.json",
    "2": "liam",
    "5": "hello world"
  },
  labels: [{ label1: "1" }, { label2: "2" }, { label3: "4" }, { label4: "7" }]
};

const fileSource = path.join(
  constants.ROOTPATH,
  "database",
  "liam",
  "Test_user",
  "master_manifest.json"
);

const fileDest = path.join(constants.ROOTPATH, "testing", "dest");

// Id can be either label or number
function getManifestPath(id) {
  let idFromLabel = null;
  // Check each key in the labels array
  masterManifest.labels.forEach(label => {
    if (Object.keys(label)[0] === id) {
      idFromLabel = label[id];
    }
  });
  const manifestID = idFromLabel || id;
  return masterManifest.manifest_lists[manifestID.toString()] || false;
}

// console.log(getManifestPath("1"));
// console.log(getManifestPath("label1"));
// console.log(getManifestPath(5));
// console.log(getManifestPath(1));
