const GameCore = require('./game/gameCore.js');
const OnlineGame = require('./game/onlineGame.js');
const Data = require('./game/data.js');
const Render = require('./game/rendering.js');
const Router = require('./router.js');

let gtSelected = "gt_online";
let bsSelected = "bs_15";

const setNewGameSelections = () => {
	Array.from(document.getElementsByClassName('ngButton')).forEach((newGameButton) => {
		newGameButton.style.border = "1px solid transparent";
	});
	$(gtSelected).style.border = "1px solid black";
	$(bsSelected).style.border = "1px solid black";
};

$('newGameStartButton').addEventListener('click', () => {
	Router.setPath('game');
	//gameObj.boardSize = Number(bsSelected.splice(3, 5));
	GameCore.setGameMode(gtSelected);
	Data.updateRules({"boardSize": Number(bsSelected.slice(3, 5))});
	Render.initBoard();
	GameCore.resetBoard();
	if (gtSelected === 'gt_online')
		OnlineGame.requestGame();
});

document.addEventListener('click', (e) => {
	let element = e.target;
	if (element.id.slice(0, 3) == 'gt_') {
		gtSelected = element.id;
	} else if (element.id.slice(0, 3) == 'bs_') {
		bsSelected = element.id;
	}
	setNewGameSelections();
});

setNewGameSelections();
