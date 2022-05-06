const router = require("express").Router();
const bcrypt = require("bcrypt");

//Importing the Schema's
const User = require("../Schemas/UserSchema");

//Creating a User
router.post("/create", async (req, res) => {
  //Destructuring the contents of the request
  const { name, username, email, password } = req.body;

  try {
    //Hashing the password using bcrypt

    //Genrating the Salt
    const salt = await bcrypt.genSalt(10);

    //Genrating Hashed password
    const hashedPassword = await bcrypt.hash(password, salt);

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
  const { email, password } = req.body;

  try {
    //Finding the user with email in database
    const user = await User.findOne({ email });
    !user && res.status(404).json("User Not Found!");

    //Checking that the entered password is matched
    const validPassword = await bcrypt.compare(password, user.password);
    !validPassword && res.status(401).json("Unauhtorized! Wrong Passowrd");

    //Sending back the response
    res.status(200).json(user);
  } catch (error) {
    //Error Handling
    res.status(400).json(error);
  }
});

module.exports = router;
