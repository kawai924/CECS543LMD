'use strict';
const fs = require('fs');
const constants = require('../server/constants');
const path = require('path');
const ff = require('../private/js/FolderFunctions');

const fileSource = path.join(
  constants.ROOTPATH,
  'database',
  'liam',
  'Test_user',
  'master_manifest.json'
);

const fileDest = path.join(constants.ROOTPATH, 'testing', 'dest');
