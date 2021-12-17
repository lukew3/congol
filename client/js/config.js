const baseConfig = {
	"boardSize": 15,
	"totalRounds": 100,
	"roundTime": 1000,
	"startingPieceCount": 3,
	"maxPieceCount": 12,
	"scoreLimit": 100,
	"colors": [
		"#EDEDED",
		"blue",
		"red"
	],
}

const local2pConfig = {
	"boardSize": 15,
	"totalRounds": 100,
	"roundTime": 1000,
	"startingPieceCount": 3,
	"maxPieceCount": 12,
	"scoreLimit": 100,
	"colors": [
		"#EDEDED",
		"blue",
		"red"
	],
	"speciesCount": 2
}

const soloConfig = {
	"boardSize": 15,
	"totalRounds": 100,
	"roundTime": 1000,
	"startingPieceCount": -1,
	"scoreLimit": -1,
	"speciesCount": 1,
	"colors": [
		"#EDEDED",
		"black"
	],
}

module.exports = {
	baseConfig,
	local2pConfig,
	soloConfig
}
