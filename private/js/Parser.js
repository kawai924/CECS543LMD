const RepoHandler = require("./RepoHandler");
const { ROOTPATH, COMMANDS } = require("./../../constants");
const path = require("path");

const test_create = "create project_name";

const test_checkin = "checkin project_name path";

let manifestID;
const test_checkout = "checkout project_name target_path manifestID";

// const test_merge_out =
//   "mergeout project_name source_manifest_id target_manifest_id";
// const test_merge_in = "mergein merge_out_manifest_id";

function parser(prompt) {
  const argsArr = prompt.split(" ");

  // Check if command is valid and map to enum COMMANDS
  const inputCommand = mapCommand(argsArr[0].toLowerCase());

  // Check whether enough arguments are supplied
  if (!validNumberArgs(inputCommand, argsArr.length)) {
    throw new Error("Not enough arguments");
  }
}

parser(test_create);

/** Helper functions
 * *****************/
function mapCommand(commandStr) {
  switch (commandStr) {
    case "create":
      return COMMANDS.CREATE;
    case "check-in":
      return COMMANDS.CHECKIN;
    case "check-out":
      return COMMANDS.CHECKOUT;
    case "merge-out":
      return COMMANDS.MERGE_OUT;
    case "merge-in":
      return COMMANDS.MERGE_IN;
    default:
      throw new Error("Invalid commands");
  }
}

function validNumberArgs(command, numberArgs) {
  return numberArgs === getNumberArgs(command);
}

function getNumberArgs(command) {
  const numArgsPerCommandDict = {
    [COMMANDS.CREATE]: 2,
    [COMMANDS.CHECKIN]: 3,
    [COMMANDS.CHECKOUT]: 4,
    [COMMANDS.MERGE_OUT]: 4,
    [COMMANDS.MERGE_IN]: 2
  };

  return numArgsPerCommandDict[command];
}
