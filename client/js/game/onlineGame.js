const Data = require('./data.js');
const Render = require('./rendering.js');
const Router = require('../router.js');
const socket = io();


socket.on('gameUpdate', (data) => {
  //if (Data.getGameVars().mode !== 'gt_online') return;
	Data.updateGameVars(data);
	Render.domObjs.playerSwitch.checked = data.switchPos;
	Render.renderAll();
	// This doesn't need to  be updated every time
	document.getElementById(`p1Username`).innerHTML = data.p1Username;
	document.getElementById(`p2Username`).innerHTML = data.p2Username;
	if (Data.getGameVars().playerId !== -1)
		document.getElementById(`p${Data.getGameVars().playerId+1}Username`).innerHTML = "Me";
	//checkScoreLimit();
});

socket.on('setPlayerId', (playerId) => {
	console.log('received Player id: ' + playerId)
	Data.updateGameVars({ playerId });
});

socket.on('setRoomId', (roomId) => {
	console.log("received room id: " + roomId);
	Router.setPath(`game/${roomId}`);
});

const requestGame = () => {
	let roomId = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
	if (roomId === '' || roomId === 'game')
		roomId = -1
	console.log("room from path: " + roomId);
	socket.emit('gameRequest', roomId);
};

const sendMove = () => {
	socket.emit('playerMove', {
		'data': Data.getGameVars().data,
		'piecesAvail': Data.getGameVars().piecesAvail,
		'scores': Data.getGameVars().scores,
		'inProgress': Data.getGameVars().inProgress
	});
};

module.exports = {
  requestGame,
  sendMove
}
