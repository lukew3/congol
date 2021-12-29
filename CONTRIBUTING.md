# Contributing
Thanks for your interest in contributing to Congol. In this document you will learn how to setup the project on your machine and gain an understanding of how the project is structured.

## Contents
* [Setup](#setup)
* [Project Structure](#structure)

## Setup
1. Install nodejs and mongodb. Guide on install nodejs [here](https://nodejs.dev/learn/how-to-install-nodejs). Guide on how to install mongodb [here](https://docs.mongodb.com/manual/administration/install-community/)
2. Clone the repository
```
git clone https://github.com/lukew3/congol.git
```
3. Install npm dependencies by running
```
npm ci
```
inside the congol folder/directory.
4. (optional) Inside the server folder, copy `example.env` to `.env`. You can modify the values in the `.env` file to configure your environment, such as changing the port that the site is hosted on or choosing a different mongodb uri.
5. Run the application by running
```
npm run start
```
This will build and serve the project. You will be able to access it by going to `127.0.0.1:3000` or `localhost:3000` in your web browser. The application will rebuild itself whenever you make a change to a file, so there is no need to quit and restart the process when you make changes.

## Structure
Congol uses an express server with a mongo database and a vanilla javascript frontend. Socket.io is used to allow users to communicate back and forth with the server. The client is built using gulp. Gulp handles copying static files such as images, merging and minifying css files, compiling pug code into html, and building/minifying js with browserify. Once it is built, the client code is stored in the `dist` folder.

### Server
The server sends the file `index.html` and it's requested static files no matter what the url requested is. Routing is handled by `client/router.js`, which sets the display of pages to "block" or "none" depending on if they are visible or not.

### Client
#### Pug
Gulp generates `index.html` from the `index.pug` file inside `client/pug`. `index.pug` includes `head.pug` and each page inside of the `pages` directory.

#### Js
Gulp generates `bundle.js` from `main.js` inside `client/js`. `main.js` requires a few other modules/files, which load other modules/files that they need.

#### CSS
Gulp merges the files in `client/styles` into one file `styles.css`. To make css easier to write, it is split by it's scope. There is a different file for each page as well as a file `shared.css` that affects elements on many different pages.
