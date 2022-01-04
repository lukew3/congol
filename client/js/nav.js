const Router = require('./router.js');
const User = require('./user.js');

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

document.getElementById('navLogout').addEventListener('click', (e) => {
  e.preventDefault();
  window.localStorage.removeItem('access_token');
  window.localStorage.removeItem('refresh_token');
  renderLoggedIn();
  Router.setPath('');
});

document.getElementById('navAccount').addEventListener('click', (e) => {
  e.preventDefault();
  User.loadUser(localStorage.username);
  Router.setPath(`user/${localStorage.username}`);
});

const renderLoggedIn = () => {
  if (window.localStorage.access_token) {
    document.getElementById('navSignup').style.display = 'none';
    document.getElementById('navLogin').style.display = 'none';
    document.getElementById('navLogout').style.display = 'none';
    document.getElementById('navAccount').style.display = 'block';
    document.getElementById('navAccount').href = `/user/${window.localStorage.getItem('username')}`
  } else {
    document.getElementById('navSignup').style.display = 'block';
    document.getElementById('navLogin').style.display = 'block';
    document.getElementById('navLogout').style.display = 'none';
    document.getElementById('navAccount').style.display = 'none';
  }
}

renderLoggedIn();

module.exports = {
  renderLoggedIn
}
