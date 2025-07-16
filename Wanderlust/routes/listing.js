const express = require("express");
const router = express.Router();
const listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");

const multer = require('multer');
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

router.route("/")
    // show/index route
    .get(wrapAsync(async (req, res) => {
        const allListings = await listing.find({});
        res.render("listings/index.ejs", { allListings });
    }))
    // Create route
    .post(isLoggedIn, upload.single('listing[image]'),
        validateListing,
        wrapAsync(async (req, res, next) => {
            let url = req.file.path;
            let filename = req.file.filename;
            let newlisting = new listing(req.body.listing);
            console.log(req.user)
            newlisting.owner = req.user._id;
            newlisting.image = { url, filename };
            await newlisting.save();
            req.flash("success", "New Listing Created");
            console.log("created", newlisting);
            res.redirect("/listings");
        }))

// new route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

router.route("/:id")
    // show route
    .get(wrapAsync(async (req, res) => {
        const { id } = req.params;
        console.log("showing", id);
        let Listing = await listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
        if (!Listing) {
            req.flash("error", "Listing you requested, does not exist");
            res.redirect("/listings");
        }
        console.log(Listing);
        res.render("listings/show.ejs", { Listing });
    }))
    // update route
    .put(isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing, wrapAsync(async (req, res) => {
            let { id } = req.params;
            const Listing = await listing.findByIdAndUpdate(id, { ...req.body.listing });
            if (typeof req.file !== "undefined") {
                let url = req.file.path;
                let filename = req.file.filename;
                Listing.image = { url, filename };
                await Listing.save();
            }
            console.log(listing, "changes saved");
            req.flash("success", "Listing Updated");
            res.redirect(`/listings/${id}`);
        }))
    // delete route 
    .delete(isLoggedIn, isOwner, wrapAsync(async (req, res) => {
        let { id } = req.params;
        let deletedListing = await listing.findByIdAndDelete(id);
        console.log("deletedListing", deletedListing);
        req.flash("success", "Listing Deleted");
        res.redirect("/listings");
    }))

// edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let editlisting = await listing.findById(id);
    if (!editlisting) {
        req.flash("error", "Listing you requested, does not exist");
        res.redirect("/listings");
    }
    let originalImageURL = editlisting.image.url;

    if (originalImageURL.includes("/upload")) {
        originalImageURL = originalImageURL.replace("/upload", "/upload/w_400");
    } else if (originalImageURL.includes("fit=crop&w=800")) {
        originalImageURL = originalImageURL.replace("fit=crop&w=800", "fit=crop&w=400");
    }
    res.render("listings/edit.ejs", { editlisting, originalImageURL });
}));

module.exports = router;