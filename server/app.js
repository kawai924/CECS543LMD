const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const pug = require('pug');

const constants = require('./constants');
const PORT = 3000;

// Import routers
const index = require('./routes/index.js');
const user = require('./routes/user');
const testing = require('./routes/testing');

const app = express();

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

app.listen(PORT, function() {
  // Set callback action fcn on network port.
  console.log('App.js listening on port ' + PORT);
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
