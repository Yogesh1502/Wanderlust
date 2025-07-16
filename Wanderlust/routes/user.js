const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

router.route("/signup")
    .get((req, res) => {
        res.render("users/signup");
    })
    .post(wrapAsync(async (req, res) => {
        try {
            let { username, email, password } = req.body;
            const newUser = new user({ email, username });
            const registeredUser = await user.register(newUser, password);
            console.log(registeredUser);
            req.flash("success", `${username} is registered successfully`);
            res.redirect("/login");
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/signup");
        }
    }))

router.route("/login")
    .get((req, res) => {
        res.render("users/login");
    })
    .post(
        passport.authenticate("local",
            { failureRedirect: "/login", failureFlash: true }
        ), (async (req, res) => {
            req.flash("success", "Welcome back, " + req.user.username);
            res.redirect("/listings");
        }))

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err)
            return next(err);
        }
        req.flash("success", "You are Successfully Logged Out!");
        res.redirect("/listings");
    })
});

module.exports = router;

