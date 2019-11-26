const { DB_PATH, VSC_REPO_NAME, MANIFEST_DIR } = require("./index");
const { MasterManReader } = require("./Master");
const { ManifestReader } = require("./Manifest");
const path = require("path");
const fs = require("fs");

class View {
  constructor() {
    this.viewState = new ViewAll();
  }

  addUsername(username) {
    this.username = username;
    this.viewState = new ViewOneUser(this.username);
    return this;
  }

  addProject(projectName) {
    this.projectName = projectName;
    this.viewState = new ViewOneUserOneProj(this.username, this.projectName);
    return this;
  }

  removeProject() {
    this.projectName = null;
    this.viewState = new ViewOneUser(this.username);
    return this;
  }

  removeUsername() {
    this.username = null;
    this.viewState = new ViewAll();
    return this;
  }

  //if there is username, no project name, execute return an arary of manifests of all projects
  //if there is username, with project name, execute return an arary of manifests of a projects
  //if there is no username, execute return an array of an array of manifests of all projects
  execute() {
    this.viewState.execute();
  }
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

    let projsWithMans = [];
    projects.map(proj => {
      projsWithMans.push(new ViewOneUserOneProj(this.username, proj).execute());
    });

    return {
      user: this.username,
      projects: projsWithMans
    };
  }
}

class ViewAll {
  constructor() {}

  execute() {
    const dbPath = DB_PATH;
    const users = fs
      .readdirSync(dbPath)
      .filter(filename => /^(?!\.).*$/.test(filename)); //ignore DOT FILES

    return users.map(user => {
      const projects = new ViewOneUser(user).execute();
      return {
        user,
        projects
      };
    });
  }
}

module.exports = {
  View,
  ViewAll,
  ViewOneUserOneProj,
  ViewOneUser
};
