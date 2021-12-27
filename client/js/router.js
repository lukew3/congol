const defaultPage = document.getElementById('gamePage');
const rulesPage = document.getElementById('rulesPage');
const newGamePage = document.getElementById('newGamePage');
const err404Page = document.getElementById('err404Page');

const setPage = (pageId) => {
	[defaultPage, rulesPage, newGamePage, err404Page].forEach((pageDiv) => {
		pageDiv.style = 'display: none;';
	});
	document.getElementById(pageId).style = 'display: block;';
};

const setPath = (path) => {
	window.history.pushState({ id: path }, `Congol - ${path}`, '/'+path);
	handlePath();
};

const handlePath = () => {
	const path = window.location.pathname;
	if (path === '/') {
		setPage('newGamePage');
	} else if (path === '/rules') {
		setPage('rulesPage');
	} else if (path.substring(0, 5) == '/game') {
		setPage('gamePage');
	} else {
		setPage('err404Page');
	}
};

window.addEventListener('popstate', (e) => {
	// When back button is pressed
	handlePath();
});

document.getElementById('err404Button').addEventListener('click', (e) => { setPath(''); });

handlePath();

module.exports = {
	setPath
}
