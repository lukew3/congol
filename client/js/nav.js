const { setPage } = require('./router.js');

document.getElementById('navTitle').addEventListener('click', (e) => {
        setPage('defaultGamePage');
});

document.getElementById('navRules').addEventListener('click', (e) => {
        setPage('rulesPage');
});

document.getElementById('navPlay').addEventListener('click', (e) => {
        setPage('newGamePage');
});