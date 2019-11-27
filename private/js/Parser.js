const { COMMANDS, DB_PATH } = require("./");
const { ProjectHandler } = require("./ProjectHandler");
const fs = require("fs");
const path = require("path");

module.exports = function() {
  let _command_guides = {
    [COMMANDS.CREATE]: "create | <project name>",
    [COMMANDS.CHECKIN]: "checkin | <project name> | <(optional) from path>",
    [COMMANDS.CHECKOUT]:
      "checkout | <project name> | <from_username> | <from manifest id> OR <label name",
    [COMMANDS.MERGE_OUT]:
      "mergeout | <project name> | <target manifest id> | <source username> | <souce manifest id>",
    [COMMANDS.MERGE_IN]: "<mergein> | <project name>",
    [COMMANDS.LABEL]: "label | <project name> | <label name> | <manifest id>",
    [COMMANDS.REMOVE]: "remove | <project name>"
  };

  const commandParse = (username, prompt) => {
    prompt = prompt.trim(); // Remove white space
    const [command, projectName] = prompt.split(" ");
    let projPath, manifestID;

    switch (command) {
      case COMMANDS.CREATE:
        new ProjectHandler(username).forProject(projectName).create();
        break;

      case COMMANDS.CHECKIN:
        _checkIfProjPresent(username, projectName);
        [, , projPath] = splitAndAppend(prompt, getDefaultNumArgs(command) - 1);

        new ProjectHandler(username).forProject(projectName).checkin(projPath);
        break;

      case COMMANDS.CHECKOUT:
        [, , fUsername, fManifestID] = splitAndAppend(
          prompt,
          getDefaultNumArgs(command) - 1
        );
        _checkIfProjPresent(fUsername, projectName);
        new ProjectHandler(username)
          .forProject(projectName)
          .checkout(fUsername, projectName, fManifestID);
        break;

      case COMMANDS.LABEL:
        _checkIfProjPresent(username, projectName);
        [, , lName, manifestID] = splitAndAppend(
          prompt,
          getDefaultNumArgs(command) - 1
        );

        new ProjectHandler(username)
          .forProject(projectName)
          .label(manifestID, lName);
        break;

      case COMMANDS.REMOVE:
        _checkIfProjPresent(username, projectName);
        new ProjectHandler(username).forProject(projectName).remove();
        break;

      default:
        throw new Error("Wrong command");
    }
  };

  /** Helper functions
   * *****************/
  const getDefaultNumArgs = command => {
    switch (command) {
      case COMMANDS.CREATE:
        return _command_guides[COMMANDS.CREATE].split("|").length;
      case COMMANDS.CHECKIN:
        return _command_guides[COMMANDS.CHECKIN].split("|").length;
      case COMMANDS.CHECKOUT:
        return _command_guides[COMMANDS.CHECKOUT].split("|").length;
      case COMMANDS.MERGE_OUT:
        return _command_guides[COMMANDS.MERGE_OUT].split("|").length;
      case COMMANDS.MERGE_IN:
        return _command_guides[COMMANDS.MERGE_IN].split("|").length;
      case COMMANDS.LABEL:
        return _command_guides[COMMANDS.LABEL].split("|").length;
      default:
        throw new Error("Wrong command");
    }
  };

  const splitAndAppend = (str, count, delim = " ") => {
    const arr = str.split(delim);
    return [...arr.splice(0, count), arr.join(delim)];
  };

  const _checkIfProjPresent = (username, projectName) => {
    const projPath = path.join(DB_PATH, username, projectName);
    if (!fs.existsSync(projPath)) {
      throw new Error("Project doesn't exist");
    }
  };

  return {
    commandParse
  };
};
