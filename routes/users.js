var express = require("express");
var router = express.Router();
//Uniq ID
var uniqid = require("uniqid");
const productModel = require("../models/products");
const { findById } = require("../models/users");

// Import of User Model
var userModel = require("../models/users");
var bcrypt = require("bcrypt");
var uid2 = require("uid2");

var uniqid = require("uniqid");

// Import of User Model
var userModel = require("../models/users");

//Set-Up Cloudinary
var cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "CHANGE CLOUD NAME",
  api_key: "CHANGE API KEY",
  api_secret: "CHANGE API SECRET",
});

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/* POST user to database. */
router.post("/sign-up", async function (req, res, next) {
  console.log(req.body);

  const cost = 10;
  const hash = bcrypt.hashSync(req.body.passwordFromFront, cost);

  var error = [];
  var result = false;
  var saveUser = null;
  var token = null;

  const data = await userModel.findOne({
    email: req.body.emailFromFront,
  });

  if (data != null) {
    error.push("❌ I think, you are already registred 😎");
  }

  if (req.body.emailFromFront == "" || req.body.passwordFromFront == "") {
    error.push("❌ Ooops, i need more informations 😉");
  }

  if (error.length == 0) {
    var newUser = new userModel({
      email: req.body.emailFromFront,
      password: hash,
      token: uid2(32),
    });

    saveUser = await newUser.save();

    if (saveUser) {
      result = true;
      token = saveUser.token;
    }
  }

  res.json({ result, saveUser, error, token });
});

// POST existing user
router.post("/sign-in", async function (req, res, next) {
  var error = [];
  var result = false;
  var searchUser = null;
  var token = null;

  if (req.body.emailFromFront == "" || req.body.passwordFromFront == "") {
    error.push("❌ Ooops, i need more informations 😉");
  }

  if (error.length == 0) {
    var searchUser = await userModel.findOne({
      email: req.body.emailFromFront,
    });
  }

  if (searchUser) {
    if (bcrypt.compareSync(req.body.passwordFromFront, searchUser.password)) {
      result = true;
    } else {
      result = false;
      searchUser = null;
      error.push("❌ Email or password doesn't match ☹️");
    }
  } else {
    error.push("❌ Email or password doesn't match ☹️");
  }

  res.json({ result, searchUser, token, error });
});

module.exports = router;
