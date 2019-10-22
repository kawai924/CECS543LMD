const path = require("path");
const PUBLICPATH = path.join(__dirname, "../public");
const APPPATH = path.join(PUBLICPATH, "../public/app");
const CSSPATH = path.join(PUBLICPATH, "../public/app/css");
const JSPATH = path.join(PUBLICPATH, "../public/app/js");
const ROOTPATH = path.join(PUBLICPATH, "../");
const TESTPATH = path.join(ROOTPATH, "testing");

module.exports = {
  PUBLICPATH,
  APPPATH,
  CSSPATH,
  JSPATH,
  ROOTPATH,
  TESTPATH
};
