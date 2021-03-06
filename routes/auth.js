var express = require("express");
var authRouter = express.Router();

const passport = require("passport");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

// /api/auth/checkuser
authRouter.get("/checkuser", (req, res, next) => {
  console.log("we are on /checkuser");

  if (req.user) {
    res.json({
      userDoc: {
        // what takes the user with
        // ? userDoc: req.user?
        _id: req.user.id,
        name: req.user.name,
        addedFooditems: req.user.addedFooditems
      }
    });
  } else {
    res.json({ userDoc: null });
  }
});

// /api/auth/signup
authRouter.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    res.status(400).json({ message: "Provide username and password" });
    return;
  }

  if (password.length < 7) {
    res.status(400).json({
      message:
        "Please make your password at least 8 characters long for security reasons."
    });
    return;
  }

  User.findOne({ username }).then(foundUser => {
    if (foundUser) {
      res.status(400).json({ message: "Username taken. Choose another one." });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    const aNewUser = new User({
      username: username,
      password: hashPass
    });

    aNewUser.save().then(newUser => {
      req.login(newUser, err => {
        res.status(200).json(newUser);
      });
    });
  });
});

//POST /api/auth/login
authRouter.post("/login", (req, res, next) => {
  console.log("user sucessfully logged in");
  passport.authenticate("local", (err, theUser, failureDetails) => {
    console.log("user is authenticated");
    if (err) {
      res
        .status(500)
        .json({ message: "Something went wrong authenticating user" });
      return;
    }

    if (!theUser) {
      // "failureDetails" contains the error messages
      // from our logic in "LocalStrategy" { message: '...' }.
      res.status(401).json(failureDetails);
      return;
    }

    // save user in session
    req.login(theUser, err => {
      if (err) {
        res.status(500).json({ message: "Session save went bad." });
        return;
      }

      // We are now logged in (that's why we can also send req.user)
      res.status(200).json(theUser);
    });
  })(req, res, next);
  console.log("login finished");
});

//POST /logout
authRouter.get("/logout", (req, res, next) => {
  // req.logout()  by passport
  req.logout();
  res.redirect("/");

  res.status(200).json({ message: "Logout!" });
});

module.exports = authRouter;
// app.use("/api/auth", authRouter);
