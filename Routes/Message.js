const router = require("express").Router();
const cryptojs = require("crypto-js");

//Importing the Schema's
const Message = require("../Schemas/MessageSchema");

//Create a Message
router.post("/", async (req, res) => {
  //Creating a new Message
  const newMessage = new Message(req.body);

  try {
    //Saving the new Message to the database
    const hashedMessage = cryptojs.AES.encrypt(
      newMessage,
      process.env.SEC
    ).toString();

    //Saving the Hashed message to database
    await hashedMessage.save();

    //Sending the resposne
    res.status(200).json("Message Sent!");
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Get the Messages
router.get("/:conversationId", async (req, res) => {
  try {
    //Finding the conversation messsages using the conversation id
    const hashedMessages = await Message.find({
      conversationId: req.params.conversationId,
    });

    //Decrypting the message
    const messages = await cryptojs.AES.decrypt(
      hashedMessages,
      process.env.SEC
    ).toString(cryptojs.enc.Utf8);

    //Sending back the resposne
    res.status(200).json(messages);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Exporting the Router
module.exports = router;
