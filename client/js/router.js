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

module.exports = {
	setPage
}
