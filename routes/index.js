const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require('passport');
const { $err } = require('../middleware');


// main page 🏡👀
router.get('/', (req, res) => {
    res.render('landing');
});

// register ➕🚹
router.get('/register', (req, res) => {
    res.render('register');
});

// ➕🚹✅
router.post('/register', (req, res) => {
    let { username, password } = req.body;
    User.register(new User({ username }), password, (err, user) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        passport.authenticate('local')(req, res, () => {
            res.redirect('/campgrounds');
        });
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
    failureFlash: 'Invalid username or password.'
}), (req, res) => {});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged You Out!');
    res.redirect('/campgrounds');
});




module.exports = router;
