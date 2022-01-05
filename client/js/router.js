const defaultPage = $('gamePage');
const rulesPage = $('rulesPage');
const newGamePage = $('newGamePage');
const err404Page = $('err404Page');
const signupPage = $('signupPage');
const loginPage = $('loginPage');
const userPage = $('userPage');


const setPage = (pageId) => {
	[defaultPage, rulesPage, newGamePage, err404Page, signupPage, loginPage, userPage].forEach((pageDiv) => {
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
