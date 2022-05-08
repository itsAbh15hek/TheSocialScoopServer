const router = require("express").Router();
const bcrypt = require("bcrypt");
const cryptojs = require("crypto-js");

//Importing the Schema's
const User = require("../Schemas/UserSchema");

//Creating a User
router.post("/signup", async (req, res) => {
  //Destructuring the contents of the request
  const { name, username, email, password, password2 } = req.body;

  try {
    // Checking if passwords match
    if (password !== password2) throw new Error("Passwords do not match.");

    //Genrating encrypted password
    const hashedPassword = cryptojs.AES.encrypt(
      password,
      process.env.SEC
    ).toString();

    //Creating a new User
    const user = new User({ name, username, email, password: hashedPassword });

    //Saving the new User to Database
    const newUser = await user.save();

    //Sending back the response
    res.status(200).json(newUser);
  } catch (error) {
    //Error Hnadling
    res.status(400).json(error);
  }
});

//User Login
router.post("/login", async (req, res) => {
  //Destructing the Body Props
  const { username, password } = req.body;

  try {
    //Finding the user with email in database
    const user = await User.findOne({ username });
    !user && res.status(404).json("User Not Found!");

    //Checking that the entered password is matched
    const hashedPassword = await cryptojs.AES.decrypt(
      user.password,
      process.env.SEC
    );
    const userPassword = hashedPassword.toString(cryptojs.enc.Utf8);

    if (password !== userPassword)
      res.status(401).json("Unauhtorized! Wrong Passowrd");

    //Sending back the response
    res.status(200).json(user);
  } catch (error) {
    //Error Handling
    res.status(400).json(error);
  }
});

module.exports = router;
