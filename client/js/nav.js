const Router = require('./router.js');
const User = require('./user.js');

$('navTitle').addEventListener('click', (e) => {
  e.preventDefault();
  Router.setPath('');
});

$('navRules').addEventListener('click', (e) => {
  e.preventDefault();
  Router.setPath('rules');
});

$('navPlay').addEventListener('click', (e) => {
  e.preventDefault();
  Router.setPath('');
});

$('navSignup').addEventListener('click', (e) => {
  e.preventDefault();
  Router.setPath('signup');
});

$('navLogin').addEventListener('click', (e) => {
  e.preventDefault();
  Router.setPath('login');
});

$('navLogout').addEventListener('click', (e) => {
  e.preventDefault();
  window.localStorage.removeItem('access_token');
  window.localStorage.removeItem('refresh_token');
  renderLoggedIn();
  Router.setPath('');
});

$('navAccount').addEventListener('click', (e) => {
  e.preventDefault();
  User.loadUser(localStorage.username);
  Router.setPath(`user/${localStorage.username}`);
});

const renderLoggedIn = () => {
  if (window.localStorage.access_token) {
    $('navSignup').style.display = 'none';
    $('navLogin').style.display = 'none';
    $('navLogout').style.display = 'none';
    $('navAccount').style.display = 'block';
    $('navAccount').href = `/user/${window.localStorage.getItem('username')}`
  } else {
    $('navSignup').style.display = 'block';
    $('navLogin').style.display = 'block';
    $('navLogout').style.display = 'none';
    $('navAccount').style.display = 'none';
  }
}

renderLoggedIn();

module.exports = {
  renderLoggedIn
}
