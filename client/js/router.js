const defaultPage = document.getElementById('defaultGamePage');
const rulesPage = document.getElementById('rulesPage');
const newGamePage = document.getElementById('newGamePage');

const setPage = (pageId) => {
	[defaultPage, rulesPage, newGamePage].forEach((pageDiv) => {
		pageDiv.style = 'display: none;';
	});
	document.getElementById(pageId).style = 'display: block;';
}
const setPath = (path) => {
	window.history.pushState({ id: path }, `Congol - ${path}`, '/'+path);
	handlePath();
}
const handlePath = () => {
	const path = window.location.pathname;
	if (path === '/' || path === '/newGame' || path === '/index.html') {
		// New Game
		setPage('newGamePage');
	} else if (path === '/rules') {
		// Rules
		setPage('rulesPage');
	} else if (path === '/game') {
		setPage('defaultGamePage');
	} else {
		// 404 
		setPage('newGamePage');
	}
}

window.addEventListener('popstate', (e) => {
	// When back button is pressed
	handlePath();
});

handlePath();

module.exports = {
	setPath
}
