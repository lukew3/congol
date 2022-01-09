const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const socketio = require('socket.io');
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const { connectDB, mongoDB } = require("./mongodb");
const GameMethods = require('./gameMethods.js');
const AccountMethods = require('./accountMethods.js');


const app = express();
const server = http.createServer(app);
io = socketio(server);

dotenv.config();
const port = process.env.PORT || 3000;
const indexPg = path.join(__dirname, '../dist/index.html');

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../dist')));

/* Socket */
let connectionsCounter = 0;
io.on('connection', async (socket) => {
  connectionsCounter++;
  io.sockets.emit('connectionCountUpdate', connectionsCounter);
  let roomId, playerId; // maybe should be playerRole instead of playerId

  socket.on('gameRequest', async (reqData) => {
    reqData.username = usernameFromToken(reqData.token) || 'Anonymous';
    let retData = await GameMethods.handleGameRequest(io, socket, reqData);
    if (!retData) return;
    roomId = retData[0];
    playerId = retData[1];
  });
  socket.on('playerMove', (moveData) => {
    GameMethods.receiveMove(io, moveData, roomId);
  });
  socket.on('endGame', async (endData) => {
    // Should winner be set to the username of the winner instead of the playerId?
    GameMethods.endGame(roomId, endData);
  });
  socket.on('disconnect', async () => {
    GameMethods.disconnect(roomId);
    connectionsCounter--;
    io.sockets.emit('connectionCountUpdate', connectionsCounter);
  });
});

const usernameFromTokenMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  req.username = usernameFromToken(token);
  next();
}

const usernameFromToken = (token) => {
  if (token === null) {
    return null;
  }
  let username;
  jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
    if (err) {
      console.log(err);
      username = null;
    } else {
      username = data.username;
    }
  });
  return username;
}

/* Routes */
app.post('/api/signup', async (req, res) => {
  const token = await AccountMethods.signUp(req.body)
  res.json(token);
});

app.post('/api/login', async (req, res) => {
  const token = await AccountMethods.login(req.body)
  res.json(token);
});

app.get('/api/user/:username', usernameFromTokenMiddleware, async (req, res) => {
  const user = await AccountMethods.getUser(req.params.username);
  // if (username === user.username) // send private details
  res.send(user)
});

// Handle page requests
app.get('*', (req, res) => {
  res.sendFile(indexPg);
});


connectDB().then(() => {
  server.listen(port);
  console.log(`Listening on port ${port}...`);
});
