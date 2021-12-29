const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const socketio = require('socket.io');
const { connectDB, mongoDB } = require("./mongodb");
const GameMethods = require('./gameMethods.js');

const app = express();
const server = http.createServer(app);
io = socketio(server);

dotenv.config();
const port = process.env.port || 3000;
const indexPg = path.join(__dirname, '../dist/index.html');

app.use(express.static(path.join(__dirname, '../dist')));

/* Socket */
io.on('connection', async (socket) => {
  let roomId, playerId; // maybe should be playerRole instead of playerId

  socket.on('gameRequest', async (reqRoomId) => {
    let retData = await GameMethods.handleGameRequest(io, socket, reqRoomId);
    roomId = retData[0];
    playerId = retData[1];
  });
  socket.on('playerMove', (moveData) => {
    GameMethods.receiveMove(io, moveData, roomId);
  });
  socket.on('endGame', async (winner) => {
    // Should winner be set to the username of the winner instead of the playerId?
    GameMethods.endGame(roomId, winner);
  });
  socket.on('disconnect', async () => {
    GameMethods.disconnect(roomId);
  });
});


/* Routes */

// Handle page requests
app.get('*', (req, res) => {
  res.sendFile(indexPg);
});


connectDB().then(() => {
  server.listen(port);
  console.log(`Listening on port ${port}...`);
});
