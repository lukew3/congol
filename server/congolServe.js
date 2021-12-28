const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const socketio = require('socket.io');
const { connectDB, mongoDB } = require("./mongodb");
const { nanoid } = require('nanoid');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

dotenv.config();
const port = process.env.port || 3000;
const indexPg = path.join(__dirname, '../dist/index.html');

app.use(express.static(path.join(__dirname, '../dist')));

async function main() {
  await connectDB();

  // Gameplay

  // Verify that a move is legal
  const verifyMove = async () => {
    // Check that each coordinate is within boardSize
    // Check that move doesn't overlap existing pieces?
      // Don't want too many intensive processes, so this might not be necessary
        // or check client-side
  }

  // Send entire game
  const sendGame = async (socket, roomId) => {
    let gameData = await mongoDB().collection('games').findOne({'shortId': roomId});
    // Send game to the user who requested it
    socket.emit('gameUpdate', gameData);
  }

  // Send last move to all users in room
  const broadcastMove = async (socket, roomId, move) => {
    //let gameData = await mongoDB().collection('games').findOne({'shortId': roomId});
    // Don't think that the next line is necessary
    //socket.emit('gameUpdate', gameData);
  	// Send update to all other connections
  	io.sockets.in(`game-${roomId}`).emit('broadcastMove', move);
  };

  // Receive move from player
  const receiveMove = async (socket, moveData, roomId) => {
  	//if (game.playerId !== (game.switchPos ? 1 : 0)) return;
    //let oldGameObj = await mongoDB().collection('games').findOne({'shortId': roomId});
    await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$push': {
      'moves': moveData
    }});
  	broadcastMove(socket, roomId, moveData);
  };

  const newGameId = async () => {
    // Should take arguments like boardSize, time, and rating
    // Should get the roomsize from game object, and game object should be updated when a user joins
    //Search for open game first
    let game = await mongoDB().collection('games').findOne({'p2Username': 'waiting'});
    // Create new game if no open game found
    if (game === null) {
      // creating doesn't return game object
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
    console.log(game);
    return game.shortId;
  }
  io.on('connection', async (socket) => {
  	//console.log('New WS Connection...');
    let roomId, playerId; // maybe should be playerRole instead of playerId

    socket.on('gameRequest', async (reqRoomId) => {
      //receiveGameRequest(socket, reqRoomId)
      console.log("Requested room: " + reqRoomId)
      if (reqRoomId !== -1) {
        roomId = reqRoomId;
      } else {
        roomId = await newGameId();
        console.log(roomId)
      }
      socket.join(`game-${roomId}`);
      socket.emit('setRoomId', roomId);
      playerId = io.sockets.adapter.rooms.get(`game-${roomId}`).size - 1;
    	if (playerId > 1) playerId = -1;
      // emit the users playerId, -1 if observing
    	socket.emit('setPlayerId', playerId);
      // Set player username
      if (playerId !== -1)
        await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$set': {[`p${playerId+1}Username`]: 'Anonymous'}});
        //games[roomId][`p${playerId+1}Username`] = 'Anonymous';
      console.log(`Player ${playerId} joined room ${roomId}`);
      if (playerId === 1) {
        await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$set': {'inProgress': true}});
        let gameData = await mongoDB().collection('games').findOne({'shortId': roomId});
        io.sockets.in(`game-${roomId}`).emit('gameUpdate', gameData);
      }
        //games[roomId].inProgress = true;
      // send game update when the user connects
      sendGame(socket, roomId); // Could add playerId to this data so that playerId wouldn't be sent separate
    })

  	socket.on('playerMove', (moveData) => {
  		receiveMove(socket, moveData, roomId);
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

}

main();