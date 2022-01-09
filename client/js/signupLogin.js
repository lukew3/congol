const Router = require('./router.js');
const Nav = require('./nav.js');
const { axiosApiInstance } = require('./axiosHelper.js');

$('signupSubmitButton').addEventListener('click', (e) => {
  e.preventDefault();
  axiosApiInstance.post('/api/signup', {
    email: $('signupEmail').value,
    username: $('signupUsername').value,
    password: $('signupPassword').value
  }).then((response) => {
    if (response.data.error) {
      $('signupMessage').innerHTML = response.data.error;
      return;
    }
    localStorage.setItem('username', response.data.username);
    localStorage.setItem('access_token', response.data.accessToken);
    Router.setPath('');
    Nav.renderLoggedIn();
    $('signupEmail').value = '';
    $('signupUsername').value = '';
    $('signupPassword').value = '';
    $('signupMessage').innerHTML = '';
  });
});

$('loginSubmitButton').addEventListener('click', (e) => {
  e.preventDefault();
  axiosApiInstance.post('/api/login', {
    emailUsername: $('loginEmailUsername').value,
    password: $('loginPassword').value
  }).then((response) => {
    if (response.data.error) {
      $('loginMessage').innerHTML = response.data.error;
      return;
    }
    localStorage.setItem('username', response.data.username);
    localStorage.setItem('access_token', response.data.accessToken);
    Router.setPath('');
    Nav.renderLoggedIn();
    $('loginEmailUsername').value = '';
    $('loginPassword').value = '';
    $('loginMessage').innerHTML = '';
  });
});
