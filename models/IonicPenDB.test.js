const mongoose = require("mongoose");

const config = require("../config");

const {
  database: { host, name, username, password },
} = config;

const DATABASE_NAME = name;
const DATABASE_URL = `mongodb+srv://${username}:${password}@${host}/${DATABASE_NAME}?retryWrites=true&w=majority`;

let dbConnection = null;

function getDatabaseConnection() {
  if (!dbConnection) {
    dbConnection = mongoose.createConnection(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  return dbConnection;
}
