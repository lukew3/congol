const { updateRules, setGameMode } = require('./game/game.js');

const gtOnline = document.getElementById("gt_online");
const gtLocal = document.getElementById("gt_local");
const gtSolo = document.getElementById("gt_solo");
const bs10 = document.getElementById("bs_15");
const bs25 = document.getElementById("bs_25");
const bs50 = document.getElementById("bs_40");

let gtSelected = "gt_local";
let bsSelected = "bs_15";

const updateNewGameSelections = () => {
	[gtOnline, gtLocal, gtSolo, bs10, bs25, bs50].forEach((newGameButton) => {
		newGameButton.style.border = "none";
	});
	document.getElementById(gtSelected).style.border = "1px solid black";
	document.getElementById(bsSelected).style.border = "1px solid black";
}

document.getElementById('newGameStartButton').addEventListener('click', () => {
	// maybe use router to set the page
	document.getElementById('newGamePage').style = 'display: none;';
	document.getElementById('defaultGamePage').style = 'display: block;';
	// Find a better way to do this, this only works because the game is required before newGame.js
	// Maybe you should just make the gameObj right away and then allow it to be accessed by all
	// Actually this doesn't work at all
	//gameObj.boardSize = Number(bsSelected.splice(3, 5));
	setGameMode(gtSelected);
	updateRules({"boardSize": Number(bsSelected.slice(3, 5))});
});

document.addEventListener('click', (e) => {
	let element = e.target;
	if (element.id.slice(0, 3) == 'gt_') {
		gtSelected = element.id;
	} else if (element.id.slice(0, 3) == 'bs_') {
		bsSelected = element.id;
	}
	updateNewGameSelections();
});

updateNewGameSelections();
