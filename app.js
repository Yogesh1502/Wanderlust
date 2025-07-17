const express = require("express");
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require("./connectDB");
connectDB();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError");
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const user = require("./models/user");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"));
});

// using express err
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.render("error.ejs", { message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
