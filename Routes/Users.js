const router = require("express").Router();
const bcrypt = require("bcrypt");

//Schema's
const User = require("../Schemas/UserSchema");

//Update User
router.put("/:id", async (req, res) => {
  //Destructering the body
  const { userId, password } = req.body;

  //Checking if user id is present in the database
  if (userId === req.params.id || req.body.isAdmin) {
    //Checking if the password is been requested to changed
    if (password) {
      //Updating the password using bcrypt
      try {
        const salt = await bcrypt.genSalt(10);

        req.body.password = await bcrypt.hash(password, salt);
      } catch (error) {
        //Error Handling
        return res.status(500).json(error);
      }
    }

    //Updating the user in the database
    try {
      const user = await User.findByIdAndUpdate(userId, { $set: req.body });

      res.status(200).json("Account has been Updated!");
    } catch (error) {
      //Error Handling
      res.status(500).json(error);
    }
  } else {
    //If the id don't been found in the database
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

//Get User
router.get("/:id", async (req, res) => {
  try {
    //Finding the user by id provided
    const user = await User.findById(req.params.id);

    //Modifing the object so that confidential information remains hidden
    const { password, updatedAt, isAdmin, __v, ...displayProps } = user._doc;

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

module.exports = router;
