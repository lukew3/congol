const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const { connectDB, mongoDB } = require("./mongodb");
const AccountMethods = require('./accountMethods.js');
const SocketServer = require('./socketServer.js');

const app = express();
const server = http.createServer(app);
SocketServer.initSocketServer(server);

dotenv.config();
const port = process.env.PORT || 3000;
const indexPg = path.join(__dirname, '../dist/index.html');

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../dist')));

const usernameFromTokenMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  req.username = AccountMethods.usernameFromToken(token);
  next();
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
