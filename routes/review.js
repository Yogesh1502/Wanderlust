const express = require("express");
const router = express.Router({ mergeParams: true });
const listing = require("../models/listing");
const review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// post route
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let Listing = await listing.findById(req.params.id);
    let newReview = new review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview.author);
    Listing.reviews.push(newReview);

    console.log(Listing);
    await newReview.save();
    await Listing.save();

    res.redirect(`/listings/${Listing.id}`);
}));

// delete route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // $pull operator removes from an existing array of all instnces of a values that match a specified condition. 
    await review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;