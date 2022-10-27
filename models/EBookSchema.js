const mongoose = require('mongoose');
const uuid = require('uuid');

const EBookSchema = mongoose.Schema({
  book_id: {
    type: String,
    unique: true,
    default: uuid.v1
  },
  book_title: {
    type: String
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
  },
  published: {
    type: Boolean,
    default: false
  },
  reviews: {
    type: Array,
    default: []
  },
  likes: {
    type: Array,
    default: []
  }
}, {collection : 'EBook'});

module.exports = EBookSchema;