const Router = require('./router.js');
const Nav = require('./nav.js');
const { axiosApiInstance } = require('./axiosHelper.js');

$('signupSubmitButton').addEventListener('click', (e) => {
  axiosApiInstance.post('/api/signup', {
    email: $('signupEmail').value,
    username: $('signupUsername').value,
    password: $('signupPassword').value
  }).then((response) => {
    window.localStorage.setItem('username', response.data.username);
    window.localStorage.setItem('access_token', response.data.accessToken);
    window.localStorage.setItem('refresh_token', response.data.refreshToken);
    Router.setPath('');
    Nav.renderLoggedIn();
    $('signupEmail').value = '';
    $('signupUsername').value = '';
    $('signupPassword').value = '';
  });
});

$('loginSubmitButton').addEventListener('click', (e) => {
  axiosApiInstance.post('/api/login', {
    emailUsername: $('loginEmailUsername').value,
    password: $('loginPassword').value
  }).then((response) => {
    window.localStorage.setItem('username', response.data.username);
    window.localStorage.setItem('access_token', response.data.accessToken);
    window.localStorage.setItem('refresh_token', response.data.refreshToken);
    Router.setPath('');
    Nav.renderLoggedIn();
    $('loginEmailUsername').value = '';
    $('loginPassword').value = '';
  });
});
