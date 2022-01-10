const { nanoid } = require('nanoid');
const { connectDB, mongoDB } = require("../mongodb");
const Token = require('../token.js');

const generateUsername = () => {
  return `guest_${nanoid(8)}`
}

const handleGameRequest = async (io, socket, reqData) => {
  let roomId, playerId;
  if (reqData.roomId !== -1) {
    roomId = reqData.roomId;
  } else {
    roomId = await newGameId(reqData.username, reqData.private);
  }
  let game = await mongoDB().collection('games').findOne({'shortId': roomId});
  // If game is null, tell the user that the game was not found and exit function
  if (game === null) {
    socket.emit('setGame', false);
    return;
  }
  socket.join(`game-${roomId}`);
  socket.emit('setRoomId', roomId);
  if (game.p1Username === 'waiting') {
    playerId = 0;
  } else if (game.p2Username === 'waiting') {
    playerId = 1;
    // If trying to play a game with same account, return
    if (game.p1Username === reqData.username) {
      socket.emit('setGame', false);
      return;
    }
  } else {
    playerId = -1;
  }
  // Emit the users playerId
  socket.emit('setPlayerId', playerId);
  // Set player username
  if (playerId !== -1)
    await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$set': {[`p${playerId+1}Username`]: reqData.username}});
    //games[roomId][`p${playerId+1}Username`] = 'Anonymous';
  if (playerId === 1) {
    startGame(io, roomId);
  }
  // Send game when the user connects
  sendGame(socket, roomId); // Could add playerId to this data so that playerId wouldn't be sent separate
  return [roomId, playerId];
}

// Send entire game to the user who requested it
const sendGame = async (socket, roomId) => {
  let gameData = await mongoDB().collection('games').findOne({'shortId': roomId});
  socket.emit('setGame', gameData);
};

// Send last move to all users in room
const broadcastMove = async (io, roomId, move) => {
  io.sockets.in(`game-${roomId}`).emit('broadcastMove', move);
};

// Receive move from player
const receiveMove = async (io, moveData, roomId) => {
  //if (game.playerId !== (game.switchPos ? 1 : 0)) return;
  //should find a faster way to check if it is the player's turn
    // also, doesn't work with anonymous v anonymous games because they have the same name
  let oldGameObj = await mongoDB().collection('games').findOne({'shortId': roomId});
  if (moveData.username === oldGameObj[`p${oldGameObj.moves.length%2+1}Username`]) {
    broadcastMove(io, roomId, moveData);
    await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$push': {
      'moves': moveData
    }});
  } else {
    console.log('move not from expected player')
  }
};

const newGameId = async (username, private) => {
  // Should take arguments like boardSize, time, and rating
  let game;
  // Should get the roomsize from game object, and game object should be updated when a user joins
  //Search for open game first
  if (!private) {
    // Don't need to search for a game if you are creating  private game
    // If user is a guest, don't check for a game without a user with the same name
    if (username.substring(0,6) === 'guest_') {
      game = await mongoDB().collection('games').findOne({
        'p2Username': 'waiting',
        'private': false
      });
    } else {
      game = await mongoDB().collection('games').findOne({
        'p2Username': 'waiting',
        'p1Username': {'$ne': username},
        'private': false
      });
    }
  }
  // Create new game if no open game found
  if (!game) {
    // Creating doesn't return game object
    let insertData = await mongoDB().collection('games').insertOne({
      moves: [],
      inProgress: false,
      p1Username: 'waiting',
      p2Username: 'waiting',
      winner: undefined,
      shortId: nanoid(3),
      private: private
    })
    game = await mongoDB().collection('games').findOne({'_id': insertData.insertedId});
  };
  return game.shortId;
};

const startGame = async (io, roomId) => {
  // Should also set the time that the game starts at to mongo
  await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$set': {
    'inProgress': true,
    'startTime': new Date()
  }});
  let gameData = await mongoDB().collection('games').findOne({'shortId': roomId});
  io.sockets.in(`game-${roomId}`).emit('gameStart', gameData);
};

const endGame = async (roomId, endData) => {
  await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$set': {
    'inProgress': false,
    'winner': endData.winner,
    'scores': endData.scores,
    'timers': endData.timers
  }});
}

const disconnect = async (roomId) => {
  let gameData = await mongoDB().collection('games').findOne({'shortId': roomId});
  // Delete game if player 2 didn't join
  if (gameData !== null && gameData.p2Username === 'waiting') {
    await mongoDB().collection('games').deleteOne({'shortId': roomId});
  }
}

module.exports = {
  generateUsername,
  handleGameRequest,
  sendGame,
  broadcastMove,
  receiveMove,
  newGameId,
  endGame,
  disconnect
}
