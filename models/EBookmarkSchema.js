const mongoose = require("mongoose");
const uuid = require('uuid');

const EBookmarkSchema = mongoose.Schema({
    book_id: {
      type: String
    },
    chapter_id: {
      type: String,
    },
    username: {
      type: String
    },
    char_index: { 
      type: Integer
    }
}, {collection : 'EBookmark'});

module.exports = EBookmarkSchema;