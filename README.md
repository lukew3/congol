# Congol

Conway's game of life for 2 players. Live site - [congol.net](http://congol.net)

## Developer resources
[Prioritized issues board](https://github.com/lukew3/congol/projects/1)

[Design files](https://www.figma.com/file/2FNvlsHa7aIuhYawCjx0iH/Congol)

## Setup

### Install Requirements
```
npm ci
```

### Build
```
npm run build
```
### Run
```
npm start
```
### Deploy
To deploy, install `pm2` globally with
```
npm i -g pm2
```
Then, clone the repo and run
```
npm run deploy
```
inside of the congol directory to run the production application. This can be proxied to nginx with `proxy_pass`.
