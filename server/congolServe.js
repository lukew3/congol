const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB, mongoDB } = require("./mongodb");
const GameServer = require('./gameServer.js');

const app = express();
const server = http.createServer(app);

dotenv.config();
const port = process.env.port || 3000;
const indexPg = path.join(__dirname, '../dist/index.html');

app.use(express.static(path.join(__dirname, '../dist')));



/* Routes */

// Handle page requests
app.get('*', (req, res) => {
  res.sendFile(indexPg);
});


connectDB().then(() => {
  server.listen(port);
  console.log(`Listening on port ${port}...`);
});
