const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const socketio = require('socket.io');
const { connectDB, mongoDB } = require("./mongodb");
const GameServer = require('./gameServer.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

dotenv.config();
const port = process.env.port || 3000;
const indexPg = path.join(__dirname, '../dist/index.html');

app.use(express.static(path.join(__dirname, '../dist')));


/* Socket.io */
io.on('connection', async (socket) => {
  let roomId, playerId; // maybe should be playerRole instead of playerId

  socket.on('gameRequest', async (reqRoomId) => {
    let retData = GameServer.handleGameRequest(socket, reqRoomId);
    roomId = retData[0];
    playerId = retData[1];
  });

  socket.on('playerMove', (moveData) => {
    GameServer.receiveMove(socket, moveData, roomId);
  });
  socket.on('endGame', async (winner) => {
    // Should winner be set to the username of the winner instead of the playerId?
    GameServer.endGame(roomId, winner);
  });
  socket.on('disconnect', async () => {
    GameServer.disconnect(roomId);
  });
});


/* Routes */

// Account
app.get('*', (req, res) => {

})



// Handle page requests
app.get('*', (req, res) => {
  res.sendFile(indexPg);
});


connectDB().then(() => {
  server.listen(port);
  console.log(`Listening on port ${port}...`);
});
