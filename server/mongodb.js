const { MongoClient } = require("mongodb");
const dotenv = require('dotenv');

let mongoClient;
dotenv.config();

let db_uri = process.env.DB_URI || 'mongodb://127.0.0.1:27017';
let db_name = process.env.DB_NAME || 'congol';

module.exports = {
  async connectDB() {
    let options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    if (process.env.DB_USERNAME && process.env.DB_PASSWORD) {
      options.auth = {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
      };
    }

    if (process.env.DB_AUTH_MECHANISM) {
      options.authMechanism = process.env.DB_AUTH_MECHANISM;
    }

    if (process.env.DB_AUTH_SOURCE) {
      options.authSource = process.env.DB_AUTH_SOURCE;
    }

    return MongoClient.connect(db_uri, options)
      .then((client) => {
        mongoClient = client;
      })
      .catch((e) => {
        console.log(e);
        process.exit(1);
      });
  },
  mongoDB() {
    if (!mongoClient) throw new Error("Could not connect to the database");
    return mongoClient.db(db_name);
  },
};
