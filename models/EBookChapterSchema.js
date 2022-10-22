const mongoose = require("mongoose");
const uuid = require('uuid');

const EBookChapterSchema = mongoose.Schema({
  chapter_id: {
    type: String,
    unique: true,
    default: uuid.v1
  },
  chapter_name: {
    type: String
  },
  chapter_contents: { 
    type: String
  },
  book_id: {
    type: String
  }
}, {collection : 'EBookChapter'});

module.exports = EBookChapterSchema;