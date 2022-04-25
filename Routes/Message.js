const router = require("express").Router();

//Importing the Schema's
const Message = require("../Schemas/MessageSchema");

//Create a Message
router.post("/", async (req, res) => {
  //Creating a new Message
  const newMessage = new Message(req.body);

  try {
    //Saving the new Message to the database
    const message = await newMessage.save();

    //Sending the resposne
    res.status(200).json(message);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Get the Messages
router.get("/:conversationId", async (req, res) => {
  try {
    //Finding the conversation messsages using the conversation id
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });

    //Sending back the resposne
    res.status(200).json(messages);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Exporting the Router
module.exports = router;
