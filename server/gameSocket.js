const GameServer = require('./gameServer.js');
const socketio = require('socket.io');

let io;

const initIO = (server) => {
  io = socketio(server);
}


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
