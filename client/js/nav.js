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

$('navAccountDropdown').style.display = 'none';
document.addEventListener('click', (e) => {
  if (e.target.id === 'navAccountDropdownToggle') {
    $('navAccountDropdown').style.display = ($('navAccountDropdown').style.display==='none') ? 'block' : 'none';
  } else if ($('navAccountDropdown').style.display === 'block') {
    $('navAccountDropdown').style.display = 'none';
  }
})

$('navAccount').addEventListener('click', (e) => {
  e.preventDefault();
  User.loadUser(localStorage.username);
  Router.setPath(`user/${localStorage.username}`);
});

$('navSettings').addEventListener('click', (e) => {
  e.preventDefault();
  Router.setPath('settings');
});

$('navLogout').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('access_token');
  renderLoggedIn();
  Router.setPath('');
});

const renderLoggedIn = () => {
  if (localStorage.access_token) {
    $('navSignup').style.display = 'none';
    $('navLogin').style.display = 'none';
    $('navAccountDropdownToggle').style.display = 'block';
    $('navAccount').href = `/user/${localStorage.getItem('username')}`
  } else {
    $('navSignup').style.display = 'block';
    $('navLogin').style.display = 'block';
    $('navAccountDropdownToggle').style.display = 'none';
  }
}


renderLoggedIn();

module.exports = {
  renderLoggedIn
}
