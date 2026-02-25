require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./src/config/db");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./src/middleware/errorhandler.middleware");
connectDB();


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

app.use(cors(
  {
    origin: process.env.CLIENT_URL,
    credentials: true,
  }
))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const userRouter = require("./src/router/user.router");
const taskRouter = require("./src/router/task.router");


app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);



app.use(errorHandler);


const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});