const mongoose = require("mongoose");

const UserProfileSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (value.length < 5) throw new Error("Invalid email address.");
      },
    },
    profile_image: {
      data: Buffer,
      contentType: String,
    },
    public_account: {
      type: Boolean,
      default: true,
    },
    library: {
      type: Array,
      default: [],
    },
    works: {
      type: Array,
      default: [],
    },
  },
  { collection: "UserProfile" }
);

module.exports = UserProfileSchema;
