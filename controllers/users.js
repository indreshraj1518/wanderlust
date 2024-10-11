const User = require("../models/user");
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registerUser = await User.register(newUser, password);
    console.log(registerUser);
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome on WunderLust😊");
      res.redirect("/listing");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back on wunderLust !");
  let redirectUrl = res.locals.redirectUrl || "/listing";
  res.redirect(redirectUrl);
};
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged Out!");
    res.redirect("/listing");
  });
};
