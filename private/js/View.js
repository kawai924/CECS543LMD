const { DB_PATH, VSC_REPO_NAME, MANIFEST_DIR } = require("./index");
const { MasterManReader } = require("./Master");
const { ManifestReader } = require("./Manifest");
const path = require("path");
const fs = require("fs");

class View {
  //if there is username, no project name, execute return an arary of manifests of all projects
  //if there is username, with project name, execute return an arary of manifests of a projects
  //if there is no username, execute return an array of an array of manifests of all projects
  execute() {}
}

class ViewOneUserOneProj {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
  }

  execute() {
    const masManReader = new MasterManReader(this.username, this.projectName);
    const manReader = new ManifestReader(this.username, this.projectName);

    const masMan = masManReader.getMasMan();

    return {
      ...masMan,
      manifests: masMan.manifests.map(man =>
        manReader._getManByID(man.manifestID)
      )
    };
  }
}

class ViewOneUser {
  constructor(username) {
    this.username = username;
  }

  execute() {
    const userPath = path.join(DB_PATH, this.username);
    const projects = fs.readdirSync(userPath);

    console.log(projects);
  }
}

class ViewAll {
  execute() {
    const dbPath = DB_PATH;
    const users = fs
      .readdirSync(dbPath)
      .filter(filename => /^(?!\.).*$/.test(filename)); //ignore DOT FILES

    const usersAndProjs = users.map(user => {
      const projects = fs.readdirSync(path.join(dbPath, user));
      return { user, projects };
    });

    const output = [];
    usersAndProjs.forEach(user => {
      const projsList = user.projects;
      projsList.map(proj => {});
    });

    console.log(JSON.stringify(usersAndProjs));
  }
}

module.exports = {
  View,
  ViewAll,
  ViewOneUserOneProj,
  ViewOneUser
};
