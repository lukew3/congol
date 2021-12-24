const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const socketio = require('socket.io');
const { connectDB, mongoDB } = require("./mongodb");
const { nanoid } = require('nanoid');

async function main() {
  await connectDB();
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
  let games = [];
  const sendGameUpdate = async (socket, roomId) => {
  	// send update to move sender
    let gameData = await mongoDB().collection('games').findOne({'shortId': roomId});
  	socket.emit('gameUpdate', gameData);
  	// send update to all other connections
  	io.sockets.in(`game-${roomId}`).emit('gameUpdate', gameData);
  };
  const receiveMove = async (socket, moveData, roomId) => {
  	//if (game.playerId !== (game.switchPos ? 1 : 0)) return;
    let oldGameObj = await mongoDB().collection('games').findOne({'shortId': roomId});
    await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$set': {
      'data': moveData.data,
      'piecesAvail': moveData.piecesAvail,
      'scores': moveData.scores,
      'inProgress': moveData.inProgress,
      //opposite of switchPos
      'switchPos': !oldGameObj.switchPos,
      //increment round
      'round': oldGameObj.round+1
    }});
  	sendGameUpdate(socket, roomId);
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
        data: createEmptyData(),
      	piecesAvail: [3,3],
      	round: 0,
      	switchPos: false,
        scores: [0,0],
  	    inProgress: false,
  	    p1Username: 'waiting',
  	    p2Username: 'waiting',
  	    winner: undefined,
        shortId: nanoid()
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
      if (playerId === 1)
        await mongoDB().collection('games').updateOne({'shortId': roomId}, {'$set': {'inProgress': true}});
        //games[roomId].inProgress = true;
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

}

main();
