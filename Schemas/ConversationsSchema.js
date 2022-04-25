const mongoose = require("mongoose");

//Creating the Conversation Schema
const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

//Exporting the Schema
module.exports = mongoose.model("Conversation", ConversationSchema);
