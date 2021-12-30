const Router = require('./router.js');

document.getElementById('navTitle').addEventListener('click', (e) => {
  e.preventDefault();
  Router.setPath('');
});

document.getElementById('navRules').addEventListener('click', (e) => {
  e.preventDefault();
  Router.setPath('rules');
});

document.getElementById('navPlay').addEventListener('click', (e) => {
  e.preventDefault();
  Router.setPath('');
});

document.getElementById('navSignup').addEventListener('click', (e) => {
  e.preventDefault();
  Router.setPath('signup');
});

document.getElementById('navLogin').addEventListener('click', (e) => {
  e.preventDefault();
  Router.setPath('login');
});
