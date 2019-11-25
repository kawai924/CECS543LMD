const {
  manifestReader,
  manifestWriter,
  masterManReader,
  masterManWriter
} = require("../Handlers");

const fs = require("fs");

const aliceMMR = new masterManReader("Alice", "ProjectX");
const aliceMR = new manifestReader("Alice", "ProjectX");

// console.log(aliceMR.getMan(1574676128256));
// console.log(aliceMR.getMan(56464));
// console.log(aliceMR.getMan("label_3"));
// console.log(aliceMR._getManByLabel("label_3"));
// console.log(aliceMR.getMan("label_4"));
fs.unlinkSync(
  "/Users/chinhnguyen/Dropbox/School/CSULB/Master/Fall 2019/543/Project 1/Project/CECS543LMD/database/john/beta/.vcsx/info.json"
);
const testMasManWrite = new masterManWriter("john", "beta");
testMasManWrite.writeFreshMasMan();
console.log(testMasManWrite._isMasManPresent());

// testMasManWrite.addNewMan({
//   manifestID: 1234,
//   manifestPath: "random"
// });
// testMasManWrite.addLabel(111111, "my_label");
// testMasManWrite.writeHead(99999);
// console.log("head = " + testMasManWrite.getHead());
