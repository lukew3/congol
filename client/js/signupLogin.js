const Router = require('./router.js');
const Nav = require('./nav.js');
const { axiosApiInstance } = require('./axiosHelper.js');

document.getElementById('signupSubmitButton').addEventListener('click', (e) => {
  axiosApiInstance.post('/api/signup', {
    email: document.getElementById('signupEmail').value,
    username: document.getElementById('signupUsername').value,
    password: document.getElementById('signupPassword').value
  }).then((response) => {
    window.localStorage.setItem('username', response.data.username);
    window.localStorage.setItem('access_token', response.data.accessToken);
    window.localStorage.setItem('refresh_token', response.data.refreshToken);
    Router.setPath('');
    Nav.renderLoggedIn();
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupPassword').value = '';
  });
});

document.getElementById('loginSubmitButton').addEventListener('click', (e) => {
  axiosApiInstance.post('/api/login', {
    emailUsername: document.getElementById('loginEmailUsername').value,
    password: document.getElementById('loginPassword').value
  }).then((response) => {
    window.localStorage.setItem('username', response.data.username);
    window.localStorage.setItem('access_token', response.data.accessToken);
    window.localStorage.setItem('refresh_token', response.data.refreshToken);
    Router.setPath('');
    Nav.renderLoggedIn();
    document.getElementById('loginEmailUsername').value = '';
    document.getElementById('loginPassword').value = '';
  });
});
