const { axiosApiInstance } = require('./axiosHelper.js');
const GameCore = require('./game/gameCore.js');
const Data = require('./game/data.js');
const OnlineGame = require('./game/onlineGame.js');

let loadedUser = {}
let userGamesList = $('userGamesList');

const loadUser = async (username=undefined) => {
  if (loadedUser.username && loadedUser.username === loadedUser) return;
  if (username === undefined)
    username = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
  loadedUser = (await axiosApiInstance.get(`/api/user/${username}`)).data;
  $('userUsername').innerHTML = loadedUser.username;
  $('uStatRating').innerHTML = loadedUser.rating;
  $('uStatGames').innerHTML = loadedUser.games.length;
  userGamesList.innerHTML = '';
  loadedUser.games.forEach((game) => {
    addGame(game, username);
  })
  // listen for click on view buttons
  let viewBtns = document.getElementsByClassName('userGameView');
  Array.from(viewBtns).forEach((element) => {
    element.addEventListener('click', () => {
      event.preventDefault();
      GameCore.setGameMode('gt_online');
      Data.updateRules({"boardSize": 15, "speciesCount": 2});
    	GameCore.resetBoard();
    	OnlineGame.requestGame(element.href.substring(element.href.lastIndexOf('/') + 1));
    });
  });
}

const addGame = (game, username) => {
  if (game.winner === null) return;
  let playerId = (game.p1Username === username) ? 0 : 1;
  let outcome = (game.scores[playerId]>game.scores[Math.abs(playerId-1)]) ? 'W' : 'L';
  let gameDiv = document.createElement('div');
  gameDiv.classList.add('userGame');
  gameDiv.innerHTML = `
    <div class='userGamePlayers'>
      <p>${game.p1Username}</p>
      <p>${game.p2Username}</p>
    </div>
    <div class='userGameScore'>
      <p>${game.scores[0]}</p>
      <p>${game.scores[1]}</p>
    </div>
    <p class='userGameResult${outcome}'>${outcome}</p>
    <p>${game.moves.length}</p>
    <p>January 4, 2022</p>
    <a href='/game/${game.shortId}' class='userGameView'>view</a>
  `;
  userGamesList.append(gameDiv);
}

if (window.location.pathname.substring(0, 6) === '/user/') {
  loadUser();
}


module.exports = {
  loadUser
}