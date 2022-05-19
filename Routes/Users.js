const router = require("express").Router();
const cryptojs = require("crypto-js");

//Schema's
const User = require("../Schemas/UserSchema");

//Update User
router.put("/:id", async (req, res) => {
  //Destructering the body
  const { _id: userId, password } = req.body;
  console.log(req.body);
  //Checking if user id is present in the database
  if (userId === req.params.id || req.body.isAdmin) {
    //Checking if the password is been requested to changed
    if (password) {
      //Updating the password using AES
      try {
        req.body.password = await cryptojs.AES.encrypt(
          password,
          process.env.SEC
        ).toString();
      } catch (error) {
        //Error Handling
        console.log(error.message);
        return res.status(500).json(error.message);
      }
    }

    //Updating the user in the database
    try {
      const user = await User.findByIdAndUpdate(userId, { $set: req.body });

      res.status(200).json("Account has been Updated!");
    } catch (error) {
      //Error Handling
      console.log(error.message);
      res.status(500).json(error.message);
    }
  } else {
    //If the id don't been found in the database
    console.log(error.message);
    return res.status(403).json("You can only update your Account!");
  }
});

//Delete User
router.delete("/:id", async (req, res) => {
  //Finding the id in the database
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      //Deleting the user using the id provide
      await User.findByIdAndDelete(req.params.id);

      //Sending back the response
      res.status(200).json("Account has been Deleted");
    } catch (error) {
      //Error Handling
      res.status(500).json(error);
    }
  } else {
    //If the id don't matched in the database
    res.status(403).json("You can Delete your Account!");
  }
});

//Get Searched Users
router.get("/:query", async (req, res) => {
  try {
    //Finding the user by id provided
    // const user = await User.findById(req.params.id);
    let user = await User.where("username").equals(
      ($regex = new RegExp("^" + req.params.query.toLowerCase(), "i"))
    );

    if (user.length === 0) {
      user = await User.where("name").equals(
        ($regex = new RegExp("^" + req.params.query.toLowerCase(), "i"))
      );
    }

    //Modifying the object so that confidential information remains hidden
    const { password, updatedAt, isAdmin, __v, ...displayProps } = user;

    //Sending back the response
    res.status(200).json(displayProps);
  } catch (error) {
    //Error Handling
    res.status(500).json(error.message);
  }
});

//Get a User
router.get("/user/:username", async (req, res) => {
  try {
    //Finding user in the database using username
    const user = await User.find({ username: req.params.username });

    //Modifying the object so that confidential information remains hidden
    const { password, updatedAt, isAdmin, __v, ...displayProps } = user[0]._doc;
    //Sending back the response
    res.status(200).json(displayProps);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Follow User
router.put("/follow/:id", async (req, res) => {
  //Chcking that the requested user is not trying to following itself
  if (req.body.userId !== req.params.id) {
    try {
      //Finding the requested user and the current user from the database
      const requestedUser = await User.findById(req.params.id);
      const user = await User.findById(req.body.userId);

      //Checking if the user is been followed by the current user
      if (!requestedUser.followers.includes(req.body.userId)) {
        //Updating both the users in the database
        await requestedUser.updateOne({
          $push: { followers: req.body.userId },
        });
        await user.updateOne({ $push: { following: req.params.id } });

        //Sending back the response
        res.status(200).json("User has been Followed");
      } else {
        //Sending back the response if the user is been followed already
        res.status(403).json("Already following this user!");
      }
    } catch (error) {
      //Error Handling
      res.status(500).json(error);
    }
  } else {
    //If the requested user is the current user
    res.status(403).json("You Can not follow yourself!");
  }
});

//Unfollow User
router.put("/unfollow/:id", async (req, res) => {
  //If the user is trying to unfollow itself
  if (req.body.userId !== req.params.id) {
    try {
      //Fetching the requested user and current user
      const requestedUser = await User.findById(req.params.id);
      const user = await User.findById(req.body.userId);

      //Checking if the user is already not following the requested user
      if (requestedUser.followers.includes(req.body.userId)) {
        //Updating the requested and the current user in the database
        await requestedUser.updateOne({
          $pull: { followers: req.body.userId },
        });
        await user.updateOne({ $pull: { following: req.params.id } });

        //Sending back the response
        res.status(200).json("User has been Unfollowed");
      } else {
        //If the is not been followed by the current user
        res.status(403).json("You does not follow this user!");
      }
    } catch (error) {
      //Error Handling
      res.status(500).json(error);
    }
  } else {
    //Trying to unfollow current user
    res.status(403).json("You can not Unfollow Yourself!");
  }
});

//Fetching the following of a User
router.get("/friends/:query", async (req, res) => {
  try {
    //Finding the user by username provided
    const user = await User.find({ username: req.params.query });

    //Fetching every friend details using the id given in following array
    const friends = await User.where("_id")
      .equals(user[0].following)
      .populate("following")
      .select("name profilePicture _id username");
    // console.log(friends);
    //Sending backk the response
    res.status(200).json(friends);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Fetching the followers of a User
router.get("/followers/:query", async (req, res) => {
  try {
    //Finding the user by username provided
    const user = await User.find({ username: req.params.query });

    //Fetching every friend details using the id given in following array
    const friends = await User.where("_id")
      .equals(user[0].followers)
      .populate("followers")
      .select("name profilePicture _id username");
    // console.log(friends);
    //Sending backk the response
    res.status(200).json(friends);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Changing the Default Theme
router.put("/theme/:id", async (req, res) => {
  try {
    //Finding the user in the database and changing the default theme
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: {
        prefersDarkTheme: req.body.prefersDarkTheme,
      },
    });

    //Sending back the response
    res.status(200).json({ message: "Default Theme Changed", user });
  } catch (error) {
    //Error Handling
    res.status(500).json(error.message);
  }
});

module.exports = router;
