const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDb = require("./config/db");
require("dotenv").config();
const authRoute = require("./routes/authRoute");
const postRoute = require("./routes/postRoute");
const userRoute = require("./routes/userRoute");
const jobRoute = require("./routes/jobRoute");
const schoolRoute = require("./routes/schoolRoute");
// const passport = require("./controllers/googleController");

const app = express();
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(corsOptions));

connectDb();

//routes
app.use("/auth", authRoute);
app.use("/users", postRoute);
app.use("/users", userRoute);
app.use("/candidates", jobRoute);
app.use("/students", schoolRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`server listening on ${PORT}`));
