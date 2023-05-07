const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/api/users");
require("dotenv").config();
const BASE_URL = process.env.BASE_URL;

console.log(BASE_URL);

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());

// const db = require("./config/keys").mongoURI;
const db = process.env.DATABASE;

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
