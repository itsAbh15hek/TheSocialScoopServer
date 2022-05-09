const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

//Importing the Routers
const userRouter = require("./Routes/Users");
const authRouter = require("./Routes/Auth");
const postsRouter = require("./Routes/Posts");
const conversationsRouter = require("./Routes/Conversations");
const messageRouter = require("./Routes/Message");

//Initializing the application
const app = express();

//Configuring the dotenv
dotenv.config();

//Connecting the Database
mongoose.connect(process.env.MONGO_URL, () => {
  try {
    console.log(`Connected to MongoDB`);
  } catch (error) {
    console.log(error.message);
  }
});

//Body Parser for accepting the request data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Middlewares
app.use(helmet());
app.use(morgan("common"));
app.use(cors());

//Routes
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/message", messageRouter);

//Establishing the PORT
const PORT = process.env.PORT || 8800;

//Listining on the PORT
app.listen(PORT, () => console.log(`Server Running on PORT:${PORT}`));
