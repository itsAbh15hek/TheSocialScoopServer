const router = require("express").Router();

//Importing the Schema's
const Conversations = require("../Schemas/ConversationsSchema");

//New Conversation
router.post("/", async (req, res) => {
  //Creating the new conversation
  const newConversation = new Conversations({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    //Saving new Conversation to the database
    const saveConversation = await newConversation.save();

    //Sending the response
    res.status(200).json(saveConversation);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Get the Conversations of a User
router.get("/:userId", async (req, res) => {
  try {
    //Finding the conversation including the current user using it's id
    const conversation = await Conversations.find({
      members: { $in: [req.params.userId] },
    });

    //Sending the resposne
    res.status(200).json(conversation);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Exporting the Router
module.exports = router;
