const mongoose = require("mongoose");

const EBookmarkSchema = mongoose.Schema(
  {
    book_id: {
      type: String,
    },
    chapter_id: {
      type: String,
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
