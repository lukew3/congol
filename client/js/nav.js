const Router = require('./router.js');

document.getElementById('navTitle').addEventListener('click', (e) => {
        Router.setPath('');
});

document.getElementById('navRules').addEventListener('click', (e) => {
        Router.setPath('rules');
});

document.getElementById('navPlay').addEventListener('click', (e) => {
        Router.setPath('');
});
