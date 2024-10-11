const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// this convert in router.route as index route nad create route
router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedIn,

  upload.single("listing[image]"),
  wrapAsync(listingController.createListing)
);

router.get("/new", isLoggedIn, listingController.renderNewForm);
// converting router.route as show route and update route and delete route also
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),

    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// // delete route
// router.delete(
//   "/:id",
//   isLoggedIn,
//   isOwner,
//   wrapAsync(listingController.destroyListing)
// );

module.exports = router;
