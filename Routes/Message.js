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
      newMessage.message,
      process.env.SEC
    ).toString();

    newMessage.message = hashedMessage;
    //Saving the Hashed message to database
    await newMessage.save();

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
    const messages = await Promise.all(
      hashedMessages.map(async (messageObj) => {
        const unhashedMessage = await cryptojs.AES.decrypt(
          messageObj.message,
          process.env.SEC
        ).toString(cryptojs.enc.Utf8);
        messageObj.message = unhashedMessage;
        return messageObj;
      })
    ).then((res) => res);

    //Sending back the resposne
    res.status(200).json(messages);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Exporting the Router
module.exports = router;
