const mongoose = require("mongoose");

//Creating the Post Schema
const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      max: 500,
    },
    postMedia: {
      type: String,
    },
    mediaType: {
      type: String,
      default: "",
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

//Exporting the Post Schema
module.exports = mongoose.model("Post", PostSchema);
