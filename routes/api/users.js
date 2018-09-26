const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load User model
const User = require("../../models/Users");

//@route    GET api/users/test
//@desc     Test users route
//@access   Public
router.get("/test", (req, res) => {
  res.status(200).json({ msg: "Test route of users works" });
});

//@route    POST api/users/register
//@desc     Register users route
//@access   Public
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route    POST api/users/login
//@desc     Login users route
//@access   Public
router.post("/login", (req, res) => {
  (email = req.body.email), (password = req.body.password);

  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(400).json({ nouser: "User not found" });
    }

    //Check for password
    bcrypt
      .compare(password, user.password)
      .then(isMatch => {
        if (isMatch) {
          //User Matched
          const payload = {
            id: user.id,
            name: user.name,
            email: user.email
          };

          //Sign Payload
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 36000 },
            (err, token) => {
              res.json({ status: true, token: "Bearer " + token });
            }
          );
        } else {
          return res.status(400).json({ msg: "Password missmatched" });
        }
      })
      .catch(err => console.log(err));
  });
});

//@route    GET api/users/current
//@desc     Returning User
//@access   Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);
module.exports = router;
