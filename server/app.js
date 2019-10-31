const express = require("express");
const path = require("path");
const fs = require("fs");

const index = require("./routes/index.js");
const constants = require("./constants");
const getArtifactId = require("../private/js/Artifact");
const PORT = 3000;

// Init an Express object.
const app = express();

// Serve static files
app.use(express.static("public"));

// Route to index
app.use("/", index);

//Extra features after this point
//reading dir in data
// For a given path dir,
function getFiles(dir, files_ = []) {
  // files_ = files_ || [];
  const files = fs.readdirSync(dir); // Read content in dir
  for (let i in files) {
    const subPath = dir + "/" + files[i]; // Get the next sub-path
    const fileName = /\/database.*/.exec(subPath);

    // console.log(fileName[0]);

    // If that sub-path == directory
    if (fs.statSync(subPath).isDirectory()) {
      getFiles(subPath, files_); // Recursively call

      // If not
    } else {
      files_.push(fileName); // Add that to files_ array
    }
  }

  // console.log({ dir, files_ });
  return files_;
}

// Route to URL = '/test'
app.get("/dirlist", function(req, res) {
  dirlist = getFiles(path.join(constants.ROOTPATH, "database")); // Get the list of file in database folder
  if (dirlist.length === 0) {
    return res.send('<p style="color:red"> Nothing in database folder </p>');
  }

  // Each file in dirlist will become a <p> element in HTML
  var list = "<p>";
  for (let file of dirlist) {
    list = list + file + "</br>";
  }
  list = list + "</p>";

  res.send(list);
});

// Route to URL = '/readmanifest'
app.get("/readmanifest", function(req, res) {
  manifest = fs.readFileSync(path.join(constants.ROOTPATH, "/database/dennis/py/manifests/manifest_1.json"), 'utf8'); // Get the list of file in database folder
  if (manifest.length === 0) {
    return res.send('<p style="color:red"> Nothing in database folder </p>');
  }
  else{
    content = JSON.parse(manifest);
    res.json(content.id);
    
  }

});

app.listen(PORT, function() {
  // Set callback action fcn on network port.
  console.log("App.js listening on port " + PORT);
});
