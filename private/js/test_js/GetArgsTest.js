const { COMMANDS } = require("../../../constants");

let command_guides = {
  [COMMANDS.CREATE]: "create | <project name> | <project path>",
  [COMMANDS.CHECKIN]: "check-in | <project name>",
  [COMMANDS.CHECKOUT]:
    "check-out | <target_path> | <from_username> | <from_repoName> | <from manifest id> OR <label name",
  [COMMANDS.MERGE_OUT]:
    "merge-out | <project name> | <target manifest id> | <source username> | <souce manifest id>",
  [COMMANDS.MERGE_IN]: "merge-in | <project name>"
};

const getArgsCount = str => {
  return str.split("|").length;
};

console.log(getArgsCount(command_guides[COMMANDS.CREATE]));
console.log(getArgsCount(command_guides[COMMANDS.CHECKIN]));
console.log(getArgsCount(command_guides[COMMANDS.CHECKOUT]));
console.log(getArgsCount(command_guides[COMMANDS.MERGE_OUT]));
console.log(getArgsCount(command_guides[COMMANDS.MERGE_IN]));
