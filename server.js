const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/api/users");
const app = express();
const cors = require("cors");
require("dotenv").config();
const BASE_URL = process.env.BASE_URL;

console.log(BASE_URL);
app.options("*", cors());

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
const corsOptions = {
  origin: process.env.BASE_URL,
  credentials: true,
  allowedHeaders: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyParser.json());

const db = require("./config/keys").mongoURI;
// const db = process.env.DATABASE;
console.log("change");
app.get("/", (req, res) => {
  res.status(201).json("server star");
});
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Mongoose Connected"))
  .catch((err) => console.log(err));
app.use(passport.initialize());

require("./config/passport")(passport);
app.use("/api/users", users);
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`server running on port ${port}`));
