const express = require("express");
require("dotenv").config();
const app = express();
const main = require("./config/db");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/userAuth");
const redisClient = require("./config/redis");
const problemRouter = require("./routes/problemCreator");
const submitResult = require("./routes/submit");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting")
const videoRouter = require("./routes/videoCreator")
const cors = require("cors")

app.use(cors({
  origin: 'http://localhost:5173',
  //if origin : '*' anyone can access it any host can access backend
  credentials :true
}))


app.use(express.json());
app.use(cookieParser());

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter)
app.use("/video",videoRouter);
const initializeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]); // for multiple connection
    console.log("db connected");
    app.listen(process.env.PORT, () => {
      console.log("listening at port no. : ", process.env.PORT);
    });
  } catch (err) {
    console.log("Error" + err);
  }
};

initializeConnection();
