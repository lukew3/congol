const pagesArr = Array.from(document.getElementsByClassName('page'));

const setPage = (pageId) => {
	pagesArr.forEach((pageDiv) => {
		pageDiv.style = 'display: none;';
	});
	$(pageId).style = 'display: block;';
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
	} else if (path === '/signup') {
		setPage('signupPage');
	} else if (path === '/login') {
		setPage('loginPage');
	} else if (path === '/settings') {
		setPage('settingsPage');
	} else if (path.substring(0, 5) == '/game') {
		setPage('gamePage');
	} else if (path.substring(0, 5) == '/user') {
		setPage('userPage');
	} else {
		setPage('err404Page');
	}
};

window.addEventListener('popstate', (e) => {
	// When back button is pressed
	handlePath();
});

$('err404Button').addEventListener('click', (e) => { setPath(''); });

handlePath();

module.exports = {
	setPath,
	setPage
}
