const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create listing");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!req.user || !listing.owner._id.equals(req.user._id)) {
    req.flash("error", "you are not the owner of this listing!");
    return res.redirect(`/listing/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body.listing); // Access listing object
  if (error) {
    let errMsg = error.details.map((el) => el.message);
    throw new ExpressError(400, errMsg.join(", "));
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body.listing);
  if (error) {
    let errMsg = error.details.map((el) => el.message);
    throw new ExpressError(400, errMsg.join(", "));
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author || !review.author._id.equals(req.user._id)) {
    req.flash("error", "you are not the author of this review!");
    return res.redirect(`/listing/${id}`);
  }
  next();
};
