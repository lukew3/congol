const { baseConfig } = require("./config.js");

let rules = baseConfig;
let gameVars = {
  "gameOver": false,
  "scores": [0, 0],
  "piecesAvail": [rules.startingPieceCount, rules.startingPieceCount],
  "round": 0,
  "running": false,
  "roundTimeouts": [],
  "data": [],
  "roundToggledCells": [],
  "timers": [rules.startingTime, rules.startingTime],
  "nextUp": 0,
  "mode": 'gt_online',
  'moves': []
};

const getRules = () => {
	return rules;
};

const getGameVars = () => {
	return gameVars;
};

const updateRules = (addedRulesObj) => {
        Object.keys(addedRulesObj).forEach((key) => {
                rules[key] = addedRulesObj[key];
        });
        //rules = initBoard(rules, gameVars.piecesAvail);
};

const updateGameVars = (addedGameVarsObj) => {
        Object.keys(addedGameVarsObj).forEach((key) => {
                gameVars[key] = addedGameVarsObj[key];
        });
};

module.exports = {
	getRules,
	getGameVars,
	updateRules,
  updateGameVars
}
