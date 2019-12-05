const { COMMANDS, DB_PATH } = require("./");
const { ProjectHandler } = require("./ProjectHandler");
const fs = require("fs");
const path = require("path");

module.exports = function() {
  /**
   * Layout of particular command
   */
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

  /**
   * Turn user's command into VSC system's actions.
   * @param {String} username user's username
   * @throws {Error} if the command is not in COMMANDS constant.
   * @param {String} prompt command prompt from form
   * @returns void
   */
  const commandParse = (username, prompt) => {
    prompt = prompt.trim(); // Remove white space
    const [command, projectName] = prompt.split(" ");
    let projPath, tManifestID, sUsername, sManifestID;
    console.log({ command });

    switch (command) {
      case COMMANDS.CREATE:
        new ProjectHandler(username).forProject(projectName).create();
        break;

      case COMMANDS.CHECKIN:
        _checkIfProjPresent(username, projectName);
        [, , projPath] = _splitAndAppend(
          prompt,
          _getDefaultNumArgs(command) - 1
        );

        new ProjectHandler(username).forProject(projectName).checkin(projPath);
        break;

      case COMMANDS.CHECKOUT:
        [, , fUsername, fManifestID] = _splitAndAppend(
          prompt,
          _getDefaultNumArgs(command) - 1
        );
        _checkIfProjPresent(fUsername, projectName);
        new ProjectHandler(username)
          .forProject(projectName)
          .checkout(fUsername, projectName, fManifestID);
        break;

      case COMMANDS.LABEL:
        _checkIfProjPresent(username, projectName);
        [, , lName, tManifestID] = _splitAndAppend(
          prompt,
          _getDefaultNumArgs(command) - 1
        );

        new ProjectHandler(username)
          .forProject(projectName)
          .label(tManifestID, lName);
        break;

      case COMMANDS.REMOVE:
        _checkIfProjPresent(username, projectName);
        new ProjectHandler(username).forProject(projectName).remove();
        break;

      case COMMANDS.MERGE_OUT:
        _checkIfProjPresent(username, projectName);
        [, , tManifestID, sUsername, sManifestID] = _splitAndAppend(
          prompt,
          _getDefaultNumArgs(command) - 1
        );

        new ProjectHandler(username)
          .forProject(projectName)
          .mergeOut(sUsername, sManifestID, tManifestID);
        break;

      case COMMANDS.MERGE_IN:
        _checkIfProjPresent(username, projectName);

        new ProjectHandler(username).forProject(projectName).mergeIn();
        break;

      default:
        throw new Error("Wrong command");
    }
  };

  /** Helper functions
   * *****************/
  /**
   * Use _command_guides template to return number of arguments required.
   * @param {String} command
   * @throws {Error} if the command is not in COMMANDS constant.
   * @returns {Number} Number of required arguments for the command
   */
  const _getDefaultNumArgs = command => {
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
      case COMMANDS.MERGE_OUT:
        return _command_guides[COMMANDS.LABEL].split("|").length;
      default:
        throw new Error(`Can't get number of arguments of ${command}`);
    }
  };

  /**
   * Split given string and
   * return array with number of elements equal to the given count value
   * @param {String} str A particular string
   * @param {Number} count Number of elements will be return from string
   * @param {String} delim Delimiter to split the string
   * @returns {Array} Array of string with length = count
   */
  const _splitAndAppend = (str, count, delim = " ") => {
    const arr = str.split(delim);
    return [...arr.splice(0, count), arr.join(delim)];
  };

  /**
   * Check if project of the user is in the database folder
   * @param {String} username
   * @param {String} projectName
   * @throws {Error} if project's directory doesn't exist
   * @returns {Boolean} true if project is present
   */
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
