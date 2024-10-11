const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
const wrapAsync = require("../utils/wrapAsync.js");

// signup route
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

// login route
router
  .route("/login")
  .get(wrapAsync(userController.renderLoginForm))
  .post(
    saveRedirectUrl,
    Passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

// logout route...
router.get("/logout", userController.logout);

module.exports = router;
