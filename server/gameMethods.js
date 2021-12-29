const { nanoid } = require('nanoid');
const { connectDB, mongoDB } = require("./mongodb");


const handleGameRequest = async (io, socket, reqRoomId) => {
  let roomId, playerId;
  if (reqRoomId !== -1) {
    roomId = reqRoomId;
  } else {
    roomId = await newGameId();
  }
  socket.join(`game-${roomId}`);
  socket.emit('setRoomId', roomId);
  let game = await mongoDB().collection('games').findOne({'shortId': roomId});
  // If game is null, tell the user that the game was not found and exit function
  if (game === null) {
    socket.emit('setGame', false);
    return;
  }
  if (game.p1Username === 'waiting') {
    playerId = 0;
  } else if (game.p2Username === 'waiting') {
    playerId = 1
  } else {
    playerId = -1;
  }
  // Emit the users playerId
  socket.emit('setPlayerId', playerId);
  // Set player username
  if (playerId !== -1)
    await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$set': {[`p${playerId+1}Username`]: 'Anonymous'}});
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
  //let oldGameObj = await mongoDB().collection('games').findOne({'shortId': roomId});
  broadcastMove(io, roomId, moveData);
  await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$push': {
    'moves': moveData
  }});
};

const newGameId = async () => {
  // Should take arguments like boardSize, time, and rating
  // Should get the roomsize from game object, and game object should be updated when a user joins
  //Search for open game first
  let game = await mongoDB().collection('games').findOne({'p2Username': 'waiting'});
  // Create new game if no open game found
  if (game === null) {
    // Creating doesn't return game object
    let insertData = await mongoDB().collection('games').insertOne({
      moves: [],
      inProgress: false,
      p1Username: 'waiting',
      p2Username: 'waiting',
      winner: undefined,
      shortId: nanoid(3)
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

const endGame = async (roomId, winner) => {
  await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$set': {
    'inProgress': false,
    'winner': winner
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
  handleGameRequest,
  sendGame,
  broadcastMove,
  receiveMove,
  newGameId,
  endGame,
  disconnect
}
