const Data = require('./data.js');

let domObjs = {
  "gameContainer": document.getElementById("gameContainer"),
  "boardObj": document.getElementById('gameBoard'),
  "roundCtr": document.getElementById('roundCounter'),
  "scoreObjs": [
      document.getElementById('p1Score'),
      document.getElementById('p2Score')
  ],
  "piecesObjs": [
      document.getElementById('p1PiecesAvail'),
      document.getElementById('p2PiecesAvail')
  ],
  "playerSwitch": document.getElementById("switch"),
  "timers": [
      document.getElementById('p1Timer'),
      document.getElementById('p2Timer')
  ]
}

const initBoard = () => {
  let rules = Data.getRules();
  let piecesAvail = Data.getGameVars().piecesAvail;
  let width = Math.min(screen.availWidth, 500);
  rules.boardWH = (width - 10) - ((width - 10) % rules.boardSize); // 10 pixels of space between board and edge of screen
  rules.cellWH = rules.boardWH / rules.boardSize - 2; // 2 pixels for the border
  domObjs.boardObj.innerHTML = "";
  domObjs.boardObj.style = `width: ${rules.boardWH}px; height: ${rules.boardWH}px`;
  domObjs.gameContainer.style = `width: ${rules.boardWH}px; height: ${rules.boardWH}px`;
  for (let i = 0; i < Math.pow(rules.boardSize, 2); i++) {
    let newCell = document.createElement('div');
    newCell.classList.add('cell');
    newCell.id = `cell-${i}`;
    newCell.style = `width: ${rules.cellWH}px; height: ${rules.cellWH}px`
    domObjs.boardObj.append(newCell);
  }
  renderPieces(rules, piecesAvail);
  domObjs.playerSwitch.checked = false;
  Data.updateRules(rules);
}
const renderBoard = () => {
  let data = Data.getGameVars().data;
  let colors = Data.getRules().colors;
  let boardSize = Data.getRules().boardSize;
  let cell, cellObj;
  data.forEach((row, y) => {
    row.forEach((cell, x) => {
      cellObj = document.getElementById(`cell-${y*boardSize+x}`);
      cellObj.style.backgroundColor = colors[cell];
    });
  });
}
const renderScores = () => {
  let scores = Data.getGameVars().scores;
  domObjs.scoreObjs[0].innerHTML = scores[0];
  domObjs.scoreObjs[1].innerHTML = scores[1];
}
const renderRound = () => {
  let round = Data.getGameVars().round;
  domObjs.roundCtr.innerHTML = round;
}
const renderPieces = () => {
  let gameRules = Data.getRules();
  let piecesAvail = Data.getGameVars().piecesAvail;
  if (gameRules.startingPieceCount == -1) return;
  //ideally, I think this should delete and append cells depending on the amount of children
  for (let p = 0; p < 2; p++) {
    domObjs.piecesObjs[p].innerHTML = "";
    for (let i = 0; i < piecesAvail[p]; i++) {
      let newCell = document.createElement('div');
      newCell.classList.add('cell');
      newCell.style = `width: ${gameRules.cellWH/2}px; height: ${gameRules.cellWH/2}px; background-color: ${gameRules.colors[p+1]}`
      domObjs.piecesObjs[p].append(newCell);
    }
  }
}
const pad2 = (num) => {
  return (num < 10 ? '0' : '') + num;
}
const renderTimers = () => {
  Data.getGameVars().timers.forEach((s, i) => {
    domObjs.timers[i].innerHTML = `${Math.floor(s/60)}:${pad2(s%60)}`;
  });
}


module.exports = {
	domObjs,
	initBoard,
	renderBoard,
	renderScores,
	renderRound,
	renderPieces,
	renderTimers
}