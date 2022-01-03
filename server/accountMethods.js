const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { mongoDB } = require("./mongodb");

const saltRounds = 10;

const signJWT = (username, expiration) => {
  return jwt.sign({username: username}, process.env.TOKEN_SECRET, { expiresIn: expiration }); // expires in 30 minutes
}

const createAccessToken = (username) => {
  return signJWT(username, '1800s');
}

const createRefreshToken = (username) => {
  return signJWT(username, '90d');
}


const signUp = async (reqBody) => {
  if (reqBody.password === undefined || reqBody.username === undefined || reqBody.email === undefined) {
    return {error: 'Fields incomplete'}
  }
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(reqBody.email)) {
    return {error: 'Email invalid'}
  }
  let user = await mongoDB().collection('users').findOne({ username: reqBody.username });
  if (user !== null) {
    return {error: 'Username taken'}
  }
  user = await mongoDB().collection('users').findOne({ email: reqBody.email });
  if (user !== null) {
    return {error: 'Email in use by another user'}
  }
  if (user === null) {
    const pwdHash = await bcrypt.hash(reqBody.password, saltRounds);
    await mongoDB().collection('users').insertOne({
      email: reqBody.email,
      username: reqBody.username,
      password: pwdHash
    });
    return {
      accessToken: createAccessToken(reqBody.username),
      refreshToken: createRefreshToken(reqBody.username)
    };
  }
}

const login = async (reqBody) => {
  let user = await mongoDB().collection('users').findOne({ email: reqBody.emailUsername });
  if (!user) {
    user = await mongoDB().collection('users').findOne({ username: reqBody.emailUsername });
    if (!user) return {error: 'User with that email/username not found'};
  }
  const match = await bcrypt.compare(reqBody.password, user.password);
  if (match) {
    return {
      accessToken: createAccessToken(reqBody.username),
      refreshToken: createRefreshToken(reqBody.username)
    };
  } else {
    return {error: 'Password incorrect'};
  }
}

const refresh = async (reqBody) => {
  
}

const getUser = (username) => { // Include cookies or token in parameters?

}

module.exports = {
  signUp,
  login,
  getUser
}
