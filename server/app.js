const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const constants = require('./constants');
const PORT = 3000;

const app = express();

// Import routers
const index = require('./routes/index.js');
const user = require('./routes/user');
const testing = require('./routes/testing');

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public'))); // Serve static files
app.set('view engine', 'pug');

// Routes
app.use('/', index);
app.use('/user', user);
app.use('/testing', testing);

// Route to URL = '/test'
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

//Extra features after this point
//reading dir in data
// For a given path dir,
function getFiles(dir, files_ = []) {
  files_ = files_ || [];
  const files = fs.readdirSync(dir); // Read content in dir
  for (let i in files) {
    const subPath = dir + '/' + files[i]; // Get the next sub-path
    const fileName = /\/database.*/.exec(subPath);

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
  manifest = fs.readFileSync(
    path.join(constants.ROOTPATH, '/database/dennis/py3/master_manifest.json'),
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
      list += JSON.stringify(content.manifest_lists[i]) + '</br>';
      filelocation = JSON.stringify(content.manifest_lists[i])
        .replace('"', '')
        .replace('"', '');
      //get all the manifest files and process them
      filemani = fs.readFileSync(filelocation, 'utf8');
      //out put filemani content
      filecontent = JSON.parse(filemani);
      list += JSON.stringify(filecontent.user) + '</br>';
      list += JSON.stringify(filecontent.repo) + '</br>';
      list += JSON.stringify(filecontent.structure) + '</br>';
      for (i in filecontent.structure) {
        var elem = filecontent.structure[i];
        for (var key in elem) {
          //console.log("Key: " + key);
          //console.log("Value: " + elem[key]);
          list += JSON.stringify(elem[key]) + '</br>';
        }
      }
      list += JSON.stringify(filecontent.command) + '</br>';
      list += JSON.stringify(filecontent.id) + '</br>';
      list += JSON.stringify(filecontent.datetime) + '</br>';
    }
    list += JSON.stringify(content.labels) + '</br>';

    for (i in content.labels) {
      var elem = content.labels[i];
      for (var key in elem) {
        //console.log("Key: " + key);
        //console.log("Value: " + elem[key]);
        list += JSON.stringify(elem[key]) + '</br>';
      }
    }
    //end of paragraph
    list = list + '</p>';

    //print out on page
    res.send(list);
  }
});

app.listen(PORT, function() {
  // Set callback action fcn on network port.
  console.log('App.js listening on port ' + PORT);
});
