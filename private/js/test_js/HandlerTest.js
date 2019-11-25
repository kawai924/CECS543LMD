const { ProjectHandler } = require("../Handlers");

const fs = require("fs");

fs.rmdirSync(
  "/Users/chinhnguyen/Dropbox/School/CSULB/Master/Fall 2019/543/Project 1/Project/CECS543LMD/database/henry",
  { recursive: true }
);
const henryPH = new ProjectHandler("henry").forProject("alpha");
henryPH.create();
fs.writeFileSync(
  "/Users/chinhnguyen/Dropbox/School/CSULB/Master/Fall 2019/543/Project 1/Project/CECS543LMD/database/henry/alpha/data.txt",
  ""
);
henryPH.checkin();
