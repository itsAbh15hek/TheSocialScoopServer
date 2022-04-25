const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");

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
mongoose.connect(process.env.MONGO_URL, () =>
  console.log(`Connected to MongoDB`)
);

//Body Parser for accepting the json data
app.use(express.json());

//Middleware's
app.use(helmet());
app.use(morgan("common"));

//Route's
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/message", messageRouter);

//Establishing the PORT
const PORT = process.env.PORT || 8800;

//Listining on the PORT
app.listen(PORT, () => console.log(`Server Running on PORT:${PORT}`));
