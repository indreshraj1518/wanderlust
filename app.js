// if (process.env.NODE.ENV != "production") {
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const Review = require("./models/review.js");
const { required } = require("joi");
// const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
// const wrapAsync = require("./utils/wrapAsync.js");
const listingRouter = require("./routes/listing.js");
// const review = require("./models/review.js");
const reviewRouter = require("./routes/review.js");
// const sessionOptions = require("express-session");
const cookie = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");

// const mongo_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", () => {
  console.log("error in mongo session store", err);
});
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
// app.get("/", (req, res) => {
//   res.send("hi ,i am root");
// });

app.use(session(sessionOptions));
app.use(flash());

// use of passport library for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware for flash message
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// createing fake user
// app.get("/demoUser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "indreshkumar",
//   });
//   let registerUser = await User.register(fakeUser, "helloworld");
//   res.send(registerUser);
// });

app.use("/listing", listingRouter);
app.use("/listing/:id", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page Not Found!"));
});
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err; // Provide default value
  res.status(statusCode).render("listings/error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listning on port 8080");
});
