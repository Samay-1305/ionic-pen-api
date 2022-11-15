const mongoose = require("mongoose");
const uuid = require("uuid");

const EBookSchema = mongoose.Schema(
  {
    book_id: {
      type: String,
      unique: true,
      default: uuid.v1,
    },
    book_title: {
      type: String,
      default: "",
    },
    chapters: {
      type: Array,
      default: [],
    },
    author: {
      type: String,
      default: "",
    },
    synopsis: {
      type: String,
      default: "",
    },
    categories: {
      type: Array,
      default: [],
    },
    age: {
      type: String,
      default: "",
    },
    wordcount: {
      type: String,
      default: "",
    },
    cover_image: {
      type: String,
      default: "",
    },
    published: {
      type: Boolean,
      default: false,
    },
    reviews: {
      type: Array,
      default: [],
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { collection: "EBook" }
);

module.exports = EBookSchema;
