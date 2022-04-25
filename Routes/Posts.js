const router = require("express").Router();

//Schema's
const Post = require("../Schemas/PostSchema");
const User = require("../Schemas/UserSchema");

//Create a Post
router.post("/create-post", async (req, res) => {
  //Creating the new Post using the Post Schema
  const post = new Post(req.body);

  try {
    //Saving the new post to the database
    const newPost = await post.save();

    //Sending back the response
    res.status(200).json(newPost);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Update a Post
router.put("/update-post/:id", async (req, res) => {
  try {
    //Finding Post with the id in the database
    const post = await Post.findById(req.params.id);

    //Checking if the user is same who has created the post
    if (post.userId === req.body.userId) {
      //Updating the post in the database
      await post.updateOne({ $set: req.body });

      //Sending back the response
      res.status(200).json("Post has been Updated");
    } else {
      //If the user is not same then sending this response
      res.status(403).json("You can only Update Your Posts!");
    }
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Delete a Post
router.delete("/delete-post/:id", async (req, res) => {
  try {
    //Finding the post with the given id in the database
    const post = await Post.findById(req.params.id);

    //Checking if the user is same who has created the post
    if (post.userId === req.body.userId) {
      //Deleting the post from the database
      await post.deleteOne();

      //Sending back the response
      res.status(200).json("Post has been Deleted");
    } else {
      //If the user is not same then send this resposne
      res.status(403).json("You can only Delete Your Posts!");
    }
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Like a Post
router.put("/reactions/:id", async (req, res) => {
  try {
    //Finding the post in the database
    const post = await Post.findById(req.params.id);

    //Finding the user id in the likes array
    if (!post.likes.includes(req.body.userId)) {
      //If user has not liked the post add user in the likes array
      await post.updateOne({ $push: { likes: req.body.userId } });

      //Sending back the response
      res.status(200).json("Post has been Liked!");
    } else {
      //If user has liked the post then pop the user from the likes array
      await post.updateOne({ $pull: { likes: req.body.userId } });

      //Sending back the response
      res.status(200).json("Post has been Unliked!");
    }
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Get a Post
router.get("/post/:id", async (req, res) => {
  try {
    //Finding the requested post in database
    const post = await Post.findById(req.params.id);

    //Sending back the resposne
    res.status(200).json(post);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Get timeline Posts
router.get("/", async (req, res) => {
  try {
    //Finding user in the database
    const user = await User.findById(req.body.userId);

    //Fetching all the user posts
    const userPosts = await Post.find({ userId: user._id });

    //Fetching all the user friends posts
    const freindsPosts = await Promise.all(
      user.following.map((freindId) => Post.find({ userId: freindId }))
    );

    //Sending back the response
    res.status(200).json(userPosts.concat(...freindsPosts));
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Exporting the router
module.exports = router;
