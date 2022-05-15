const mongoose = require("mongoose");

//Defining the User Schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      max: 25,
      required: true,
    },
    username: {
      type: String,
      required: true,
      min: 5,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    following: {
      type: Array,
      default: [],
    },
    followers: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      max: 50,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    preferDarkTheme: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
