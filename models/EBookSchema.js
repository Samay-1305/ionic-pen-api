const mongoose = require("mongoose");
const uuid = require('uuid');

const EBookSchema = mongoose.Schema({
  book_id: {
    type: String,
    unique: true,
    default: uuid.v1
  },
  chapters: { 
    type: Array,
    default: []
  },
  author: {
    type: String
  },
  synopsis: {
    type: String
  },
  cover_image: {
    data: Buffer,
    contentType: String
  }
}, {collection : 'EBookSchema'});

module.exports = EBookSchema;