const express = require("express");
const router = express.Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const Users = require("../../models/users");

function isFormComplete(req, res, next) {
  let body = req.body;
  if (
    body.username &&
    body.password 
  ) {
    next();
  } else {
    res.status(400).send("Please fill all the details");
  }
}

router.get("/", async (req, res) => {
  res.send("Login page");
});

router.post("/", isFormComplete, async (req, res) => {
  let body = req.body;
  try {
    let username = body.username;
    let user = await Users.findOne({ username });

    if (!user) {
      return res.status(400).send("User Doesn't exists");
    }

    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);

    const isPasswordMatched = body.password == decryptedPassword;

    if (isPasswordMatched) {
      const payload = { username };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET_KEY);
      res.json({ jwtToken }); 
    } else {
      return res.status(400).send("Invalid Password");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

module.exports = router;