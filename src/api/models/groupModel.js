const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Array limiter, to avoid more than 5 members in a group
 * @param {*} val Refer to the members array.
 */
const arrayLimit = (val) => {
    return val.length <= 5;
}

/**
 * Create a group schema with ODM Mongoose principle.
 * PS : Please remember, here, a "group" is a "form".
 */
const groupSchema = new Schema({
  members: {
    type: [Object],
    required: true,
    validate: [arrayLimit, `5 members maximum !`]
  },
  questions: {
    type: Object,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  associatedSchoolId: {
    type: String,
    required: true
  }
});

/**
 * Export the schema to create this object.
 */
module.exports = mongoose.model("Group", groupSchema);