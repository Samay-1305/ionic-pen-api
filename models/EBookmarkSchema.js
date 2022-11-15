const mongoose = require("mongoose");

const EBookmarkSchema = mongoose.Schema(
  {
    book_id: {
      type: String,
    },
    chapter_ind: {
      type: Number,
    },
    username: {
      type: String,
    },
    char_index: {
      type: Number,
    },
  },
  { collection: "EBookmark" }
);

module.exports = EBookmarkSchema;
