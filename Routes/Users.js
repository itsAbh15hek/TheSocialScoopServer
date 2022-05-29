const router = require("express").Router();
const cryptojs = require("crypto-js");

//Schema's
const User = require("../Schemas/UserSchema");

//Update User
router.put("/:id", async (req, res) => {
  //Destructering the body
  //Checking if user id is present in the database
  if (req.body._id === req.params.id || req.body.isAdmin) {
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
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

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
  const { _id: userId } = await User.findById(req.params.id);
  //Finding the id in the database
  if (!!userId || req.body.isAdmin) {
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
    res.status(403).json("You can't Delete your Account!");
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

//Send follow request to User
router.put("/follow-request/:id", async (req, res) => {
  //Chcking that the requested user is not trying to following itself
  if (req.body.userId !== req.params.id) {
    try {
      //Finding the requested user and the current user from the database
      const requestedUser = await User.findById(req.params.id);
      const requestingUser = await User.findById(req.body.userId);

      //Checking if the user is been followed by the current user
      if (
        !requestingUser.reqSent.includes(req.params.id) &&
        !requestedUser.reqRecieved.includes(req.body.userId)
      ) {
        //Updating both the users in the database
        await requestedUser.updateOne({
          $push: { reqRecieved: req.body.userId },
        });
        await requestingUser.updateOne({ $push: { reqSent: req.params.id } });

        //Sending back the response
        res.status(200).json("Request Sent");
      } else {
        //Sending back the response if the user is been followed already
        res.status(403).json("Request is pending or already following.");
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
//Approve follow request of User
router.put("/approve-follow-request/:id", async (req, res) => {
  //Chcking that the requested user is not trying to following itself
  if (req.body.userId !== req.params.id) {
    try {
      //Finding the requested user and the current user from the database
      const approvingUser = await User.findById(req.body.userId);
      const requestingUser = await User.findById(req.params.id);

      //Checking if the user is been followed by the current user
      if (
        !approvingUser.followers.includes(req.params.id) &&
        approvingUser.reqRecieved.includes(req.params.id) &&
        !requestingUser.following.includes(req.body.userId) &&
        requestingUser.reqSent.includes(req.body.userId)
      ) {
        //Updating both the users in the database
        await approvingUser.updateOne({
          $pull: { reqRecieved: req.params.id },
        });
        await approvingUser.updateOne({
          $push: { followers: req.params.id },
        });
        await requestingUser.updateOne({
          $push: { following: req.body.userId },
        });
        await requestingUser.updateOne({ $pull: { reqSent: req.body.userId } });

        //Sending back the response
        res.status(200).json("User has been Followed");
      } else {
        //Sending back the response if the user is been followed already
        res
          .status(403)
          .json(
            "Already following this user or the user hasnt requested to follow you"
          );
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

//Unsend follow request of User
router.put("/unsend-follow-request/:id", async (req, res) => {
  //Chcking that the requested user is not trying to following itself
  if (req.body.userId !== req.params.id) {
    try {
      //Finding the requested user and the current user from the database
      const requestedUser = await User.findById(req.params.id);
      const unRequestingUser = await User.findById(req.body.userId);

      //Checking if the user is been followed by the current user
      if (
        requestedUser.reqRecieved.includes(req.body.userId) &&
        unRequestingUser.reqSent.includes(req.params.id)
      ) {
        //Updating both the users in the database
        await requestedUser.updateOne({
          $pull: { reqRecieved: req.body.userId },
        });
        await unRequestingUser.updateOne({ $pull: { reqSent: req.params.id } });

        //Sending back the response
        res.status(200).json("Request Unsent!");
      } else {
        //Sending back the response if the user is been followed already
        res.status(403).json("You have not sent request!");
      }
    } catch (error) {
      //Error Handling
      res.status(500).json(error);
    }
  } else {
    //If the requested user is the current user
    res.status(403).json("You Can not reject yourself!");
  }
});

//Reject follow request of User
router.put("/reject-follow-request/:id", async (req, res) => {
  //Chcking that the requested user is not trying to following itself
  if (req.body.userId !== req.params.id) {
    try {
      //Finding the requested user and the current user from the database
      const rejectingUser = await User.findById(req.body.userId);
      const requestingUser = await User.findById(req.params.id);

      //Checking if the user is been followed by the current user
      if (
        rejectingUser.reqRecieved.includes(req.body.userId) &&
        requestingUser.reqSent.includes(req.body.userId)
      ) {
        //Updating both the users in the database
        await rejectingUser.updateOne({
          $pull: { reqRecieved: req.body.userId },
        });
        await requestingUser.updateOne({ $pull: { reqSent: req.params.id } });

        //Sending back the response
        res.status(200).json("Request Rejected!");
      } else {
        //Sending back the response if the user is been followed already
        res
          .status(403)
          .json("This user is not following you or has now requested yet!");
      }
    } catch (error) {
      //Error Handling
      res.status(500).json(error);
    }
  } else {
    //If the requested user is the current user
    res.status(403).json("You Can not reject yourself!");
  }
});

//Unfollow User
router.put("/unfollow/:id", async (req, res) => {
  //If the user is trying to unfollow itself
  if (req.body.userId !== req.params.id) {
    try {
      //Fetching the requested user and current user
      const unfollowedUser = await User.findById(req.params.id);
      const unfollowingUser = await User.findById(req.body.userId);

      //Checking if the user is already not following the requested user
      if (
        unfollowedUser.followers.includes(req.body.userId) &&
        unfollowingUser.following.includes(req.params.id)
      ) {
        //Updating the requested and the current user in the database
        await unfollowedUser.updateOne({
          $pull: { followers: req.body.userId },
        });
        await unfollowingUser.updateOne({
          $pull: { following: req.params.id },
        });

        //Sending back the response
        res.status(200).json("User has been Unfollowed");
      } else {
        //If the is not been followed by the current user
        res.status(403).json("You do not follow this user!");
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

//Get users details
router.post("/users-details", async (req, res) => {
  try {
    const userList = req.body.data.filter((user) => user !== null);
    const detailedUserList = await Promise.all(
      userList.map(async (userId) => {
        const user = await User.findById(userId);
        return {
          userId: user._id,
          username: user.username,
          name: user.name,
          profilePicture: user.profilePicture,
        };
      })
    ).then((value) => value);
    //Sending back the response
    res.status(200).json(detailedUserList);
  } catch (error) {
    //Error Handling
    res.status(500).json(error.message);
  }
});

module.exports = router;
