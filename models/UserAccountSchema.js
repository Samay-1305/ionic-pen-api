const mongoose = require("mongoose");
const uuid = require('uuid');

const UserAccountSchema = mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length < 8) throw new Error("Invalid password length.");
      }
    },
    auth_key: {
      type: String,
      unique: true,
      default: uuid.v1
    }
  }, {collection : 'UserAccount'});

module.exports = UserAccountSchema;