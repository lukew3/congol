const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

dotenv.config();
const port = process.env.port || 3000;
const indexPg = path.join(__dirname, './dist/index.html');

app.use(express.static('dist'));

// Gameplay
const boardSize = 15;
const createEmptyData = () => {
  let myarr = [];
  for (let y = 0; y < boardSize; y++) {
    let row = [];
    for (let x = 0; x < boardSize; x++)
      row.push(0);
      myarr.push(row);
  }
  return myarr;
}
let game = {
	data: createEmptyData(),
	piecesAvail: [3,3],
	round: 0,
	switchPos: false,
	scores: [0,0]
}
const sendGameUpdate = (socket) => {
	// send update to move sender
	socket.emit('gameUpdate', game);
	// send update to all other connections
	socket.broadcast.emit('gameUpdate', game);
};
const receiveMove = (socket, moveData) => {
	//if (game.playerId !== (game.switchPos ? 1 : 0)) return;
	game.data = moveData.data;
	game.piecesAvail = moveData.piecesAvail;
	game.scores = moveData.scores;
	game.round++;
	game.switchPos = !game.switchPos;
	sendGameUpdate(socket);
};

io.on('connection', (socket) => {
	console.log('New WS Connection...');
	socket.join('game-1');

	// emit the users playerId, -1 if observing
	let playerId = io.sockets.adapter.rooms.get('game-1').size - 1;
	if (playerId > 1) playerId = -1;
	socket.emit('setPlayerId', playerId)

	// send game update when the user connects
	sendGameUpdate(socket);

	socket.on('playerMove', (data) => {
		receiveMove(socket, data);
	});
	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});


// Handle page requests
app.get('*', (req, res) => {
	res.sendFile(indexPg);
});


server.listen(port);
console.log(`Listening on port ${port}...`);
