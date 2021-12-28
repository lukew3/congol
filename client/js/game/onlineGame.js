const GameCore = require('./gameCore.js');
const Data = require('./data.js');
const Render = require('./rendering.js');
const Router = require('../router.js');
const socket = io();

socket.on('gameStart', (data) => {
  if (Data.getGameVars().mode !== 'gt_online') return;
  setUsernames(data);
  // start timers
  GameCore.updateTimer();
})

socket.on('gameUpdate', (data) => {
  if (Data.getGameVars().mode !== 'gt_online') return;
	runMoves(data.moves);
	//Data.updateGameVars(data);
	//Render.domObjs.playerSwitch.checked = data.switchPos;
	//Render.renderAll();
	// This doesn't need to  be updated every time
  setUsernames(data);
	//checkScoreLimit();
});

const setUsernames = (unData) => {
  document.getElementById(`p1Username`).innerHTML = unData.p1Username;
	document.getElementById(`p2Username`).innerHTML = unData.p2Username;
	if (Data.getGameVars().playerId !== -1)
		document.getElementById(`p${Data.getGameVars().playerId+1}Username`).innerHTML = "Me";
}

socket.on('setPlayerId', (playerId) => {
	Data.updateGameVars({ playerId });
});

socket.on('setRoomId', (roomId) => {
	Router.setPath(`game/${roomId}`);
});

socket.on('broadcastMove', (move) => {
	runMove(move);
})

const requestGame = () => {
	let roomId = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
	if (roomId === '' || roomId === 'game')
		roomId = -1
	socket.emit('gameRequest', roomId);
};

const sendMove = () => {
	socket.emit('playerMove', Data.getGameVars().roundToggledCells);
};

const runMove = (move) => {
	let playerId = (Render.domObjs.playerSwitch.checked) ? 2 : 1;
	// only toggle cells if current user wasn't the one who toggled them
	if (Data.getGameVars().playerId !== playerId-1) {
    let tempPlayerId = Data.getGameVars().playerId;
		Data.updateGameVars({"playerId": playerId-1})
		move.forEach((cellNum) => {
			GameCore.toggleCell(cellNum, playerId);
		});
		Data.updateGameVars({"playerId": tempPlayerId})
	}
	GameCore.runRound();
	//Render.domObjs.playerSwitch.checked = !Render.domObjs.playerSwitch.checked;
};

const runMoves = (moves) => {
	moves.forEach((move) => {
		runMove(move);
	});
};

module.exports = {
  requestGame,
  sendMove
}
