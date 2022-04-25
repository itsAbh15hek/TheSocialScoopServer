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
    postImage: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

//Exporting the Post Schema
module.exports = mongoose.model("Post", PostSchema);
