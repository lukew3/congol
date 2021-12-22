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
const gameTemplate = {
	data: createEmptyData(),
	piecesAvail: [3,3],
	round: 0,
	switchPos: false,
	scores: [0,0]
}
let games = [
]
let game = {
	data: createEmptyData(),
	piecesAvail: [3,3],
	round: 0,
	switchPos: false,
	scores: [0,0]
}
const sendGameUpdate = (socket, roomId) => {
	// send update to move sender
	socket.emit('gameUpdate', games[roomId]);
	// send update to all other connections
	io.sockets.in(`game-${roomId}`).emit('gameUpdate', games[roomId]);
};
const receiveMove = (socket, moveData, roomId) => {
	//if (game.playerId !== (game.switchPos ? 1 : 0)) return;
	games[roomId].data = moveData.data;//
	games[roomId].piecesAvail = moveData.piecesAvail;
	games[roomId].scores = moveData.scores;
	games[roomId].round++;
	games[roomId].switchPos = !games[roomId].switchPos;
	sendGameUpdate(socket, roomId);
};
const getRoomId = () => {
  // Should take arguments like boardSize, time, and rating
  let n = 0;
  // Should get the roomsize from game object, and game object should be updated when a user joins
  while (io.sockets.adapter.rooms.get(`game-${n}`) != undefined && io.sockets.adapter.rooms.get(`game-${n}`).size >= 2) {
    n++;
  }
  if (games.length-1 < n)
    games[n] = gameTemplate;
  return n;
}
io.on('connection', (socket) => {
	//console.log('New WS Connection...');
  let roomId, playerId; // maybe should be playerRole instead of playerId

  socket.on('gameRequest', (reqRoomId) => {
    console.log("Requested room: " + reqRoomId)
    if (reqRoomId !== -1) {
      roomId = reqRoomId;
    } else {
      roomId = getRoomId();
    }
    socket.join(`game-${roomId}`);
    socket.emit('setRoomId', roomId);
    playerId = io.sockets.adapter.rooms.get(`game-${roomId}`).size - 1;
  	if (playerId > 1) playerId = -1;
    // emit the users playerId, -1 if observing
  	socket.emit('setPlayerId', playerId);
    console.log(`Player ${playerId} joined room ${roomId}`);
    // send game update when the user connects
    sendGameUpdate(socket, roomId);
  })

	socket.on('playerMove', (data) => {
		receiveMove(socket, data, roomId);
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
