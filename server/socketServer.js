const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const GameMethods = require('./controllers/game.js');
const Token = require('./token.js');
let io, connectionsCounter

const initSocketServer = (server) => {
  io = socketio(server);

  connectionsCounter = 0;
  io.on('connection', async (socket) => {
    connectionsCounter++;
    io.sockets.emit('connectionCountUpdate', connectionsCounter);
    let roomId, playerId, username; // maybe should be playerRole instead of playerId

    socket.on('gameRequest', async (reqData) => {
      username = Token.usernameFromToken(reqData.token);
      if (!username) {
        username = GameMethods.generateUsername();
        socket.emit('setGuestUsername', {
          username: username,
          accessToken: Token.signJWT(username)
        });
      }
      reqData.username = username;
      let retData = await GameMethods.handleGameRequest(io, socket, reqData);
      if (!retData) return;
      roomId = retData[0];
      playerId = retData[1];
    });
    socket.on('playerMove', (moveData) => {
      moveData.username = username;
      GameMethods.receiveMove(io, moveData, roomId);
    });
    socket.on('endGame', async (endData) => {
      // Should winner be set to the username of the winner instead of the playerId?
      endData.username = username;
      GameMethods.endGame(roomId, endData);
    });
    socket.on('disconnect', async () => {
      GameMethods.disconnect(roomId, username);
      connectionsCounter--;
      io.sockets.emit('connectionCountUpdate', connectionsCounter);
    });
  });
}

module.exports = {
  initSocketServer
}
