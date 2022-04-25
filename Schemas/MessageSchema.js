const mongoose = require("mongoose");

//Creating the Message Schema
const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

//Exporting the Schema
module.exports = mongoose.model("Message", MessageSchema);
