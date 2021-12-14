require("./game.js");
require("./newGame.js");

const defaultPage = document.getElementById('defaultGamePage');
const rulesPage = document.getElementById('rulesPage');
const newGamePage = document.getElementById('newGamePage');

const setPage = (pageId) => {
	[defaultPage, rulesPage, newGamePage].forEach((pageDiv) => {
		pageDiv.style = 'display: none;';
	});
	document.getElementById(pageId).style = 'display: block;';
}

if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
	defaultPage.style = 'display: block;';
}

document.getElementById('navTitle').addEventListener('click', (e) => {
	setPage('defaultGamePage');
});

document.getElementById('navRules').addEventListener('click', (e) => {
	setPage('rulesPage');
});

document.getElementById('navPlay').addEventListener('click', (e) => {
	setPage('newGamePage');
});
