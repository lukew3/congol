const express = require('express');
const path = require('path');

const app = express();
const port = process.env.port || 3000;

app.use(express.static('dist'));

app.listen(port);
console.log("Listening on port 3000...");
