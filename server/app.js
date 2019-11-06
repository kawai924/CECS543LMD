const express = require('express');
const path = require('path');
const fs = require('fs');

const index = require('./routes/index.js');
const constants = require('./constants');
const getArtifactId = require('../private/js/Artifact');
const PORT = 3000;

// Init an Express object.
const app = express();

// Serve static files
app.use(express.static('public'));

// Route to index
app.use('/', index);

//Extra features after this point
//reading dir in data
// For a given path dir,
function getFiles(dir, files_ = []) {
  // files_ = files_ || [];
  const files = fs.readdirSync(dir); // Read content in dir
  for (let i in files) {
    const subPath = dir + '/' + files[i]; // Get the next sub-path
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

function readmastermani(dir){
  manifest = fs.readFileSync(
    path.join(constants.ROOTPATH, dir),
    'utf8'
  ); // Get the list of file in database folder
  if (manifest.length === 0) {
    return res.send('<p style="color:red"> Nothing in database folder </p>');
  } else {
    content = JSON.parse(manifest);
    //start of paragraph
    var list = '<p>';

    //show json content

    for (i in content.manifest_lists) {
      //list += JSON.stringify(content.manifest_lists[i]) + '</br>';
      filelocation = JSON.stringify(content.manifest_lists[i])
        .replace('"', '')
        .replace('"', '');
      //get all the manifest files and process them
      filemani = fs.readFileSync(filelocation, 'utf8');
      //out put filemani content
      filecontent = JSON.parse(filemani);
      //list += 'User:' + JSON.stringify(filecontent.user) + '</br>';
      list += 'Repo: ' + JSON.stringify(filecontent.repo)
      .replace('"', '')
      .replace('"', '') + '</br>';

      list += 'Repo Content: </br>';
      //list += JSON.stringify(filecontent.structure) + '</br>';
      for (i in filecontent.structure) {
        var elem = filecontent.structure[i];
        var elemarr = [];
        for (var key in elem) {
          elemarr.push(key);
        }
        var LIFO = elemarr.pop();
        list += JSON.stringify(elem[LIFO])
        .replace('"', '')
        .replace('"', '');
        var LIFO = elemarr.pop();
        list += JSON.stringify(elem[LIFO])
        .replace('"', '')
        .replace('"', '')  + '</br>';
      }
      //list += JSON.stringify(filecontent.command) + '</br>';
      //list += JSON.stringify(filecontent.id) + '</br>';
      var createddate = JSON.stringify(filecontent.datetime).replace('"', '')
      .replace('"', '').replace(/T/, ' ').replace(/\..+/,'');

      list += 'Created Date at UTC: ' +  createddate + '</br>';
    }
    //list += JSON.stringify(content.labels) + '</br>';

    list += 'Repo Labels: </br>';
    for (i in content.labels) {
      var elem = content.labels[i];
      for (var key in elem) {
        list += JSON.stringify(elem[key])
        .replace('"', '')
        .replace('"', '') + ' ';

      }
    }
    //end of paragraph
    list = list + '</p>';

    //print out on page
    return list;
  }
}

// Route to URL = '/dirlist'
app.get('/dirlist', function(req, res) {
  dirlist = getFiles(path.join(constants.ROOTPATH, 'database')); // Get the list of file in database folder
  if (dirlist.length === 0) {
    return res.send('<p style="color:red"> Nothing in database folder </p>');
  }

  // Each file in dirlist will become a <p> element in HTML
  var list = '<p>';
  for (let file of dirlist) {
    list = list + file + '</br>';
  }
  list = list + '</p>';

  res.send(list);
});

// Route to URL = '/readmastermani'
app.get('/readmastermani', function(req, res) {
  username = req.param("username-login");
  folder = '/database/'+username;
  folderroot = path.join(constants.ROOTPATH, folder);
  dirlist = getFiles(folderroot); // Get the list of file in database folder
  if (dirlist.length === 0) {
    return res.send('<p style="color:red"> Nothing in database folder </p>');
  }
  var out = '';
  // Each file in dirlist will become a <p> element in HTML
  for (let file of dirlist) {
    //var buf = Buffer.from(file);
    var filemaster = file[0].indexOf('master_manifest.json');
    if (filemaster>-1){
      out += readmastermani(file[0]);
    }
  }

  
  //out = readmastermani('/database/dennis/py3/master_manifest.json');
  res.send(out);
});

app.listen(PORT, function() {
  // Set callback action fcn on network port.
  console.log('App.js listening on port ' + PORT);
});
