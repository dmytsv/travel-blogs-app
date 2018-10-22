const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/user");
const methodOverride = require('method-override');
const indexRoutes = require('./routes');
const campgroundsRoutes = require('./routes/campgrounds');
const commentsRoutes = require('./routes/comments');
const flash = require('connect-flash');

const MONGODB_URL = process.env.MONGODB_URL || require("./config/keys").MONGODB_URL,
    SECRET = process.env.SECRET || require("./config/keys").SECRET;

mongoose.connect(MONGODB_URL, { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.locals.moment = require('moment');
// passport setup
app.use(require('express-session')({
    secret: SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.flashError = req.flash('error');
    res.locals.flashSuccess = req.flash('success');
    next();
});

app.use(methodOverride('_method'));
app.use('/', indexRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/comments', commentsRoutes);
app.get('*', (req, res) => {
    req.flash('error', 'Sorry but page you are looking for does not exist');
    res.redirect('/');
});



app.listen(process.env.PORT, process.env.IP, () => {
    console.log('🏁 ✅', 'Server is running');
});
