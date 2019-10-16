const path = require("path");
const PUBLICPATH = path.join(__dirname, '../public');
const APPPATH= path.join(PUBLICPATH, '../public/app');
const CSSPATH = path.join(PUBLICPATH, '../public/app/css');
const JSPATH = path.join(PUBLICPATH, '../public/app/js');

module.exports = {
    APPPATH,
    CSSPATH,
    JSPATH
};