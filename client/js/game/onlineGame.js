const GameCore = require('./gameCore.js');
const Data = require('./data.js');
const Render = require('./rendering.js');
const Router = require('../router.js');
const socket = io();

socket.on('connectionCountUpdate', (connectionCount) => {
	$('usersOnline').innerHTML = `${connectionCount} users online`;
})

socket.on('gameStart', (data) => {
  if (Data.getGameVars().mode !== 'gt_online') return;
  Data.setGameVars({'inProgress': true});
  setUsernames(data);
  // start timers
  GameCore.updateTimer();
})

const pad2 = (num) => {
  return (num < 10 ? '0' : '') + num;
};
socket.on('setGame', (data) => {
  if (Data.getGameVars().mode !== 'gt_online') return;
  if (!data) {
    Router.setPage('err404Page');
    return;
  }
  setUsernames(data);
  GameCore.runMoves(data.moves);
  Data.setGameVars({moves: data.moves, selectedRound: Data.getGameVars().round});
  if (data.timers) {
    Data.setGameVars({timers: data.timers});
    Render.renderTimers();
  }
});

socket.on('setGuestUsername', (data) => {
	localStorage.setItem('username', data.username);
	localStorage.setItem('access_token', data.accessToken)
})

const setUsernames = (uData) => {
  $(`p1Username`).innerHTML = uData.p1Username;
	$(`p2Username`).innerHTML = uData.p2Username;
	if (Data.getGameVars().playerId !== -1)
		$(`p${Data.getGameVars().playerId+1}Username`).innerHTML = "Me";
}

socket.on('setPlayerId', (playerId) => {
	Data.setGameVars({ playerId });
});

socket.on('setRoomId', (roomId) => {
  let newPath = `game/${roomId}`
  if (window.location.pathname !== '/' + newPath)
	 Router.setPath(newPath);
});

socket.on('broadcastMove', (move) => {
  GameCore.pushMove(move);
  let playerId = (Render.domObjs.playerSwitch.checked) ? 2 : 1;
  if (Data.getGameVars().playerId === playerId-1) {
    GameCore.runRound();
  } else {
    GameCore.runMove(move);
		// only send endGame from one player
		if (!Data.getGameVars().inProgress && Data.getGameVars().playerId !== -1) {
	    socket.emit('endGame', {
	      winner: Data.getGameVars().winner,
	      timers: Data.getGameVars().timers,
	      scores: Data.getGameVars().scores
	  	});
		}
  }
  Data.setGameVars({selectedRound: Data.getGameVars().round})
})

socket.on('gameForfeited', (winner) => {
	GameCore.endGame(winner);
	socket.emit('endGame', {
		winner: winner,
		timers: Data.getGameVars().timers,
		scores: Data.getGameVars().scores
	})
})

const sendForfeit = () => {
	if (Data.getGameVars().inProgress)
		socket.emit('forfeit');
}

const requestGame = (roomId=undefined) => {
  if (!roomId)
	 roomId = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
	if (roomId === '' || roomId === 'game')
		roomId = -1
	socket.emit('gameRequest', {
    roomId,
		private: $('privateCheckbox').checked,
		rated: $('ratedCheckbox').checked,
		token: localStorage.access_token
  });
};

const sendMove = () => {
	socket.emit('playerMove', Data.getGameVars().roundToggledCells);
};

module.exports = {
  requestGame,
  sendMove,
	sendForfeit
}
