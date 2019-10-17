// File: app.js
const express = require("express");
const path = require("path");
const fs = require("fs");

const index = require("./routes/index.js");
const constants = require('./constants');
const getArtifactId = require("../private/js/Artifact");
const PORT = process.env.PORT || 3000;

// Init an Express object.
const app = express();

// Serve static files
app.use(express.static('public'));

app.use("/", index);

//Extra features after this point
//reading dir in data
function getFiles(dir, files_) {
  files_ = files_ || [];
  var files = fs.readdirSync(dir);
  for (var i in files) {
    var name = dir + "/" + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
}

//get function on the url
app.get("/test", function(req, res) {
  // Set page-gen fcn for URL root request.
  //res.send('Hello Liam Matt and Marco!'); // Send webpage containing "Hello World!".
  dirlist = getFiles(path.join(constants.TESTPATH, "data"));
  var list = "<p>";
  for (let file of dirlist) {
    list = list + file + "</br>";
  }
  list = list + "</p>";
  res.send(list);
});



app.listen(PORT, function() {
  // Set callback action fcn on network port.
  console.log("App.js listening on port " + PORT);
});
