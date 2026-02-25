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
app.set("trust proxy", 1);
app.use("/api", limiter);

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:5173",  
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

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