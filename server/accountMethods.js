const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { mongoDB } = require("./mongodb");

const saltRounds = 10;

const signJWT = (username) => {
  return jwt.sign({username: username}, process.env.TOKEN_SECRET, { expiresIn: '1800s' }); // expires in 30 minutes
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
    return signJWT(reqBody.username);
  }
}

const login = async (reqBody) => {
  let user = await mongoDB().collection('users').findOne({ username: reqBody.username});
  const match = await bcrypt.compare(reqBody.password, user.password);
  if (match) {
    return signJWT(reqBody.username);
  } else {
    return {error: 'Password incorrect'};
  }
}

const getUser = (username) => { // Include cookies or token in parameters?

}

module.exports = {
  signUp,
  login,
  getUser
}
