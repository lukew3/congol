const Data = require('./data.js');
const GameCore = require('./gameCore.js');

Data.updateGameVars({selectedRound: 0});

const showRound = () => {
  let holdRound = Data.getGameVars().round;
  GameCore.resetBoard();
  let moves = Data.getGameVars().moves;
  GameCore.runMoves(moves.slice(0, Math.floor(Data.getGameVars().selectedRound)));
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
