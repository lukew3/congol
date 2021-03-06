const { baseConfig } = require("./config.js");

// Rules don't change once the game starts, gameVars do
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

const setRules = (addedRulesObj) => {
        Object.keys(addedRulesObj).forEach((key) => {
                rules[key] = addedRulesObj[key];
        });
        //rules = initBoard(rules, gameVars.piecesAvail);
};

const setGameVars = (addedGameVarsObj) => {
        Object.keys(addedGameVarsObj).forEach((key) => {
                gameVars[key] = addedGameVarsObj[key];
        });
};

module.exports = {
	getRules,
	getGameVars,
	setRules,
  setGameVars
}
