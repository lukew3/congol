const Token = require('../token.js');
const bcrypt = require('bcrypt');
const { mongoDB } = require("../mongodb");

const saltRounds = 10;
const defaultTheme = {
  'board-bg-color': '#EDEDED',
  'p1-color': '#0000FF',
  'p2-color': '#FF0000',
  'grid-color': '#808080',
  'page-bg': '#E0E0E0',
  'button-bg': '#C4C4C4',
  'text-color': '#000000'
};

const signUp = async (reqBody) => {
  if (reqBody.password === undefined || reqBody.username === undefined || reqBody.email === undefined) {
    return {error: 'Form incomplete'};
  }
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(reqBody.email)) {
    return {error: 'Email invalid'};
  }
  if (reqBody.username.substring(0,6) === 'guest_') {
    return { error: 'Username invalid'};
  }
  let user = await mongoDB().collection('users').findOne({ username: reqBody.username });
  if (user !== null) {
    return {error: 'Username taken'}
  }
  user = await mongoDB().collection('users').findOne({ email: reqBody.email });
  if (user !== null) {
    return {error: 'Email in use by another user'};
  }
  if (user === null) {
    const pwdHash = await bcrypt.hash(reqBody.password, saltRounds);
    await mongoDB().collection('users').insertOne({
      email: reqBody.email,
      username: reqBody.username,
      password: pwdHash,
      rating: 1000,
      customTheme: defaultTheme
    });
    return {
      username: reqBody.username,
      accessToken: Token.signJWT(reqBody.username)
    };
  }
}

const login = async (reqBody) => {
  if (!reqBody.password || !reqBody.emailUsername)
    return {'error': 'Form incomplete'}
  let user = await mongoDB().collection('users').findOne({ email: reqBody.emailUsername });
  if (!user) {
    user = await mongoDB().collection('users').findOne({ username: reqBody.emailUsername });
    if (!user) return {error: 'No user with that email/username'};
  }
  const match = await bcrypt.compare(reqBody.password, user.password);
  if (match) {
    return {
      username: user.username,
      accessToken: Token.signJWT(user.username),
    };
  } else {
    return {error: 'Password incorrect'};
  }
}

const getUser = async (username) => { // Include cookies or token in parameters?
  let user = await mongoDB().collection('users').findOne({ username: username });
  if (!user) {
    return {
      username: 'User DNE',
      rating: 'null',
      games: []
    };
  }
  // get games where user is p1 or p1 and sort in reverse
  let games = await mongoDB().collection('games').find({ $or: [ { p1Username: username }, { p2Username: username } ] }).sort({$natural:-1}).toArray();
  return {
    username: user.username,
    rating: user.rating,
    games: games
  }
}

const getTheme = async (username) => {
  let user = await mongoDB().collection('users').findOne({ username: username });
  // Only need this if statement for accounts created before 1/16/22
  if (user && user.customTheme)
    return user.customTheme;
  else
    return defaultTheme;
}

const setTheme = async (username, reqBody) => {
  mongoDB().collection('users').updateOne({'username': username}, {'$set': { 'customTheme': reqBody }})
}

module.exports = {
  signUp,
  login,
  getUser,
  getTheme,
  setTheme
}
