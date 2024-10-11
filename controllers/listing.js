const Listing = require("../models/listing");
const { listingSchema, reviewSchema } = require("../schema.js");
const mongoose = require("mongoose");

// index route function
module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

// new render route function
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// show listing route function
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Listing ID");
  }

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "listing you requested is not exist!");
    res.redirect("/listing");
  }

  res.render("listings/show.ejs", { listing });
};
// create listing route function
module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url, "..", filename);
  let result = listingSchema.validate(req.body);

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  await newListing.save();
  req.flash("success", "new listing Created!");
  res.redirect("/listing");
};
// edit listing route function

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "listing you requested is not exist!");
    res.redirect("/listing");
  }
  let orignalImageUrl = listing.image.url;
  orignalImageUrl = orignalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing, orignalImageUrl });
};
// update listing route function
module.exports.updateListing = async (req, res) => {
  try {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
      // agar koe photo rahega tabhi edit ho payega!
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
      await listing.save();
    }
    req.flash("success", "listing updated sucessfully!");
    res.redirect(`/listing/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating listing");
  }
};

//   delete listing route function
module.exports.destroyListing = async (req, res) => {
  try {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", " listing deleted!");
    res.redirect("/listing");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting listing");
  }
};
