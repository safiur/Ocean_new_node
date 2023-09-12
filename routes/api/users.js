const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const User = require("../../models/User");
const { Pool } = require('pg'); // Import the pg library
var mysql = require("mysql");

router.post("/schema", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  if(req.body.dbType === 'postgres') {
    const pool = new Pool({
        host: req.body.name,
        port: req.body.portNumber,
        user: req.body.user,
        password: req.body.password,
        database: req.body.database
    });

    pool.query('SELECT schema_name FROM information_schema.schemata', (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
} else { // Assuming default is MySQL for any other value
    var connection = mysql.createConnection({
        host: req.body.name,
        port: req.body.portNumber,
        user: req.body.user,
        password: req.body.password,
        database: req.body.database,
    });

    connection.query("SELECT schema_name FROM information_schema.schemata", function (err, rows) {
        res.status(200).json(rows);
    });
}
});

router.post("/database", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  
    if(req.body.dbType === 'postgres') {
        const pool = new Pool({
            host: req.body.connectivity.name,
            port: req.body.connectivity.port,
            user: req.body.connectivity.user,
            password: req.body.connectivity.password,
            database: req.body.connectivity.database
        });

        pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", (error, results) => {
            if (error) {
                throw error;
            }
            console.log(results.rows);

            res.status(200).json(results.rows);
        });
    }

  

  else{
  var connection = mysql.createConnection({
    host: req.body.connectivity.name,
    port: req.body.connectivity.port,
    user: req.body.connectivity.user,
    password: req.body.connectivity.password,
    database: req.body.connectivity.database,
  });
  connection.query(
    `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema ='${req.body.databaseName}' ;`,
    function (err, rows) {
      res.status(200).json(rows);
    }
  );}
});

router.post("/databaseTable", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  if(req.body.dbType === 'postgres') {
    const pool = new Pool({
      host: req.body.connectivity.name,
      port: req.body.connectivity.port,
      user: req.body.connectivity.user,
      password: req.body.connectivity.password,
      database: req.body.connectivity.database
    });

    pool.query(`SELECT * FROM ${req.body.databaseName}.${req.body.databaseTableName}`, (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
} else {
    var connection = mysql.createConnection({
        host: req.body.connectivity.name,
        port: req.body.connectivity.port,
        user: req.body.connectivity.user,
        password: req.body.connectivity.password,
        database: req.body.connectivity.database,
    });

    connection.query(`SELECT * FROM ${req.body.databaseName}.${req.body.databaseTableName}`, function (err, rows) {
        res.status(200).json(rows);
    });
}
 
});
router.post("/queryGeneration", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  console.log(req.body);
  var connection = mysql.createConnection({
    host: req.body.connectivity.name,
    port: req.body.connectivity.port,
    user: req.body.connectivity.user,
    password: req.body.connectivity.password,
    database: req.body.connectivity.database,
  });
  connection.query(req.body.requestQuery, function (err, rows) {
    console.log(rows);
    res.status(200).json(rows);
  });
});
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        Role: req.body.Role,
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = {
          id: user.id,
          name: user.name,
          Role: user.Role,
        };

        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556929,
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});
module.exports = router;
