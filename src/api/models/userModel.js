const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Is the creation schema for School object in MongoDB.
 */
const userSchema = new Schema({
  name: {
    type: String,
    required: "Name is required.",
    trim: true
  },
  email: {
    type: String,
    required: "Email is required.",
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: "Password is required.",
    trim: true
  },
  associatedSchoolId: {
    type: String
  },
});

/**
 * Send School object to School collection in MongoDB.
 */
module.exports = mongoose.model("User", userSchema);
