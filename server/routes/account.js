const AccountController = require('../controllers/account.js');
const Token = require('../token.js');

const setup = (app) => {
  app.post('/api/signup', async (req, res) => {
    const token = await AccountController.signUp(req.body)
    res.json(token);
  });

  app.post('/api/login', async (req, res) => {
    const token = await AccountController.login(req.body)
    res.json(token);
  });

  app.get('/api/user/:username', Token.usernameFromTokenMiddleware, async (req, res) => {
    const user = await AccountController.getUser(req.params.username);
    // if (username === user.username) // send private details
    res.send(user)
  });

  app.get('/api/getTheme', Token.usernameFromTokenMiddleware, async (req, res) => {
    console.log(req.username);
    res.send(await AccountController.getTheme(req.username));
  });

  app.post('/api/setTheme', Token.usernameFromTokenMiddleware, async (req, res) => {
    await AccountController.setTheme(req.username, req.body);
    res.sendStatus(200);
  });
}

module.exports = {
  setup
}
