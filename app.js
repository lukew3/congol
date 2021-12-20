const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

const app = express();
dotenv.config();
const port = process.env.port || 3000;
const indexPg = path.join(__dirname, './dist/index.html');

app.use(express.static('dist'));

app.get('*', (req, res) => {
	res.sendFile(indexPg);
});

app.listen(port);
console.log(`Listening on port ${port}...`);
