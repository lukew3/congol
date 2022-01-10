const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
const { connectDB, mongoDB } = require("./mongodb");
const Token = require('./token.js');
const AccountRoutes = require('./routes/account.js');
const SocketServer = require('./socketServer.js');

const app = express();
const server = http.createServer(app);
SocketServer.initSocketServer(server);

dotenv.config();
const port = process.env.PORT || 3000;
const indexPg = path.join(__dirname, '../dist/index.html');

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../dist')));

AccountRoutes.setup(app);

// Handle page requests
app.get('*', (req, res) => {
  res.sendFile(indexPg);
});


connectDB().then(() => {
  server.listen(port);
  console.log(`Listening on port ${port}...`);
});
