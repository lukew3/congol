const Data = require('./data.js');
const GameCore = require('./gameCore.js');
const Render = require('./rendering.js');

Data.updateGameVars({selectedRound: 0});

const showRound = () => {
  let holdRound = Data.getGameVars().round;
  GameCore.clearBoard();
  let moves = Data.getGameVars().moves;
  let selectedRound = Data.getGameVars().selectedRound;
  GameCore.runMoves(moves.slice(0, Math.floor(Data.getGameVars().selectedRound)));
  if (selectedRound - Math.floor(selectedRound) !== 0) {
    let nextMove = moves[Math.floor(Data.getGameVars().selectedRound)];
    if (nextMove !== undefined) {
      let tempProgress = Data.getGameVars().inProgress;
      Data.updateGameVars({'inProgress': true});
      GameCore.toggleCells(nextMove);
      Data.updateGameVars({'inProgress': tempProgress});
    }
  }
  Render.renderRound(Data.getGameVars().selectedRound);
  Data.updateGameVars({round: holdRound});
}

const incrementSelRound = (val) => {
  let selectedRound = Data.getGameVars().selectedRound;
  if (val<0) {
    if (selectedRound >= Math.abs(val)) {
      selectedRound += val;
    }
  } else if (val>0) {
    if (Data.getGameVars().round - selectedRound >= val) {
      selectedRound += val;
    }
  }
  Data.updateGameVars({selectedRound});
  showRound();
}

$('roundMinusMax').addEventListener('click', (e) => {
  Data.updateGameVars({selectedRound: 0});
  showRound();
});
$('roundMinusOne').addEventListener('click', (e) => {
  incrementSelRound(-1);
});
$('roundMinusHalf').addEventListener('click', (e) => {
  incrementSelRound(-.5);
});
$('roundPlusHalf').addEventListener('click', (e) => {
  incrementSelRound(.5);
});
$('roundPlusOne').addEventListener('click', (e) => {
  incrementSelRound(1);
});
$('roundPlusMax').addEventListener('click', (e) => {
  Data.updateGameVars({selectedRound: Data.getGameVars().round});
  showRound();
});
