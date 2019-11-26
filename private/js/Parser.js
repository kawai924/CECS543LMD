const {
  COMMANDS,
  ROOTPATH,
  VSC_REPO_NAME,
  MANIFEST_DIR,
  MASTER_MANIFEST_NAME,
  DATABASE_NAME,
  DB_PATH,
  USERS_FILENAME
} = require("./");
const path = require("path");
const { ProjectHandler } = require("./ProjectHandler");

module.exports = function() {
  let _command_guides = {
    [COMMANDS.CREATE]: "create | <project name>",
    [COMMANDS.CHECKIN]: "checkin | <project name> | <(optional) from path>",
    [COMMANDS.CHECKOUT]:
      "checkout | <project name> | <from_username> | <from manifest id> OR <label name",
    [COMMANDS.MERGE_OUT]:
      "mergeout | <project name> | <target manifest id> | <source username> | <souce manifest id>",
    [COMMANDS.MERGE_IN]: "<mergein> | <project name>",
    [COMMANDS.LABEL]: "label | <project name> | <label name> | <manifest id>"
  };

  const commandParse = (username, prompt) => {
    const [command, projectName] = prompt.split(" ");
    const projectPath = path.join(DB_PATH, username, projectName);
    let fromPath, manifestID;

    switch (command) {
      case COMMANDS.CREATE:
        // new RepoHandler(username, projectName, projectPath).create();
        new ProjectHandler(username).forProject(projectName).create();
        break;

      case COMMANDS.CHECKIN:
        [, , fromPath] = splitAndAppend(
          prompt,
          " ",
          getNumberArgs(command) - 1
        );

        // new RepoHandler(username, projectName, projectPath).checkin(fromPath);
        new ProjectHandler(username).forProject(projectName).checkin(fromPath);
        break;

      case COMMANDS.CHECKOUT:
        [, , fUsername, fManifestID] = splitAndAppend(
          prompt,
          " ",
          getNumberArgs(command) - 1
        );
        // new RepoHandler(username, projectName, projectPath).checkout(
        //   fUsername,
        //   projectName,
        //   fManifestID
        // );
        new ProjectHandler(username)
          .forProject(projectName)
          .checkout(fUsername, projectName, fManifestID);
        break;
      case COMMANDS.LABEL:
        [, , lName, manifestID] = splitAndAppend(
          prompt,
          " ",
          getNumberArgs(command) - 1
        );

        // new RepoHandler(username, projectName, projectPath).addLabel(
        //   manifestID,
        //   lName
        // );
        new ProjectHandler(username)
          .forProject(projectName)
          .label(manifestID, lName);
        break;

      default:
        throw new Error("Unable to parse command");
    }
  };

  /** Helper functions
   * *****************/
  const getNumberArgs = command => {
    switch (command) {
      case COMMANDS.CREATE:
        return getArgsCount(_command_guides[COMMANDS.CREATE]);
      case COMMANDS.CHECKIN:
        return getArgsCount(_command_guides[COMMANDS.CHECKIN]);
      case COMMANDS.CHECKOUT:
        return getArgsCount(_command_guides[COMMANDS.CHECKOUT]);
      case COMMANDS.MERGE_OUT:
        return getArgsCount(_command_guides[COMMANDS.MERGE_OUT]);
      case COMMANDS.MERGE_IN:
        return getArgsCount(_command_guides[COMMANDS.MERGE_IN]);
      case COMMANDS.LABEL:
        return getArgsCount(_command_guides[COMMANDS.LABEL]);
      default:
        throw new Error("Can't get args count of the command");
    }
  };

  const getArgsCount = str => {
    return str.split("|").length;
  };

  const splitAndAppend = (str, delim, count) => {
    const arr = str.split(delim);
    return [...arr.splice(0, count), arr.join(delim)];
  };

  return {
    commandParse
  };
};
