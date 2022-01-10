const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const signJWT = (username, expiration) => {
  return jwt.sign({username: username}, process.env.TOKEN_SECRET);
}

const usernameFromToken = (token) => {
  if (!token) {
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

const usernameFromTokenMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  req.username = usernameFromToken(token);
  next();
}

module.exports = {
  signJWT,
  usernameFromToken,
  usernameFromTokenMiddleware
}
