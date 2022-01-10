const baseConfig = {
	"boardSize": 15,
	"totalRounds": 100,
	"roundTime": 1000,
	"startingPieceCount": 3,
	"maxPieceCount": 12,
	"scoreLimit": 100,
};

const local2pConfig = {
	"boardSize": 15,
	"totalRounds": 100,
	"roundTime": 1000,
	"startingPieceCount": 3,
	"maxPieceCount": 12,
	"scoreLimit": 100,
	"speciesCount": 2,
	"startingTime": 3*60,
};

const soloConfig = {
	"boardSize": 15,
	"totalRounds": 100,
	"roundTime": 1000,
	"startingPieceCount": -1,
	"scoreLimit": -1,
	"speciesCount": 1,
};

module.exports = {
	baseConfig,
	local2pConfig,
	soloConfig
}
