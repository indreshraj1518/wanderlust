const express = require("express");
const router = express.Router({ mergeParams: true });
// const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
// const listing = require("../routes/listing.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");
const reviewController = require("../controllers/review.js");

// handling validation for review

// review route post

router.post(
  "/review",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// delete review route
router.delete(
  "/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);
module.exports = router;
