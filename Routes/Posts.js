const { v4: uuid } = require("uuid");
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
    res.status(500).json(error.message);
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

//Comment on a Post
router.put("/comment/:postId", async (req, res) => {
  try {
    //Finding the post in the database
    const post = await Post.findById(req.params.postId);

    await post.updateOne({
      $push: { comments: { id: uuid(), ...req.body.commentData } },
    });
    //Sending back the response
    res.status(200).json("Comment has been posted!");
  } catch (error) {
    //Error Handling
    res.status(500).json(error.message);
  }
});

//Delete a Post
router.put("/delete-comment/:postId", async (req, res) => {
  try {
    //Finding the post in the database
    const post = await Post.findById(req.params.postId);
    const newCommentData = post.comments.filter(
      (comment) => comment.id !== req.body.commentId
    );
    //Updating posts
    await Post.updateOne(
      { _id: req.params.postId },
      { $set: { comments: newCommentData } }
    );
    //Sending back the response
    res.status(200).json("Comment has been deleted!");
  } catch (error) {
    //Error Handling
    res.status(500).json(error.message);
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

//Get a user's all posts
router.get("/profile/:id", async (req, res) => {
  try {
    //Finding the user in the database to get his _id
    // const { _id } = await User.findById(req.params.id);

    //Finding all the post using the _id
    const posts = await Post.find({ userId: req.params.id });

    const compare = (a, b) => {
      if (a.createdAt > b.createdAt) {
        return -1;
      }
      if (a.createdAt < b.createdAt) {
        return 1;
      }
      return 0;
    };
    posts.sort(compare);
    //Sending back the response
    res.status(200).json(posts);
  } catch (error) {
    //Error Handling
    res.status(500).json(error);
  }
});

//Get timeline Posts
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const users = [user._id, ...user.following];

    const postsArray = await Promise.all(
      users.map(async (id) => {
        const posts = await Post.where("userId").equals(id);
        return posts;
      })
    ).then((value) => value);

    const postData = [];

    postsArray.forEach((arr) => {
      if (arr.length > 0) arr.forEach((post) => postData.push(post));
    });

    const newPostData = await Promise.all(
      postData.map(async (post) => {
        const { name, username, profilePicture } = await User.findById(
          post.userId
        );
        const newData = { ...post._doc, name, username, profilePicture };
        return newData;
      })
    ).then((values) => values);

    const compare = (a, b) => {
      if (a.createdAt > b.createdAt) {
        return -1;
      }
      if (a.createdAt < b.createdAt) {
        return 1;
      }
      return 0;
    };

    newPostData.sort(compare);

    //Sending back the response
    res.status(200).json(newPostData);
  } catch (error) {
    //Error Handling
    res.status(500).json(error.message);
  }
});

//Exporting the router
module.exports = router;
