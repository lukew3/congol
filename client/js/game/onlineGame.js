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

socket.on('setGame', (data) => {
  if (Data.getGameVars().mode !== 'gt_online') return;
  setUsernames(data);
	runMoves(data.moves);
});

const setUsernames = (uData) => {
  document.getElementById(`p1Username`).innerHTML = uData.p1Username;
	document.getElementById(`p2Username`).innerHTML = uData.p2Username;
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
  if (!Data.getGameVars().inProgress)
    socket.emit('endGame', Data.getGameVars().winner);
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
