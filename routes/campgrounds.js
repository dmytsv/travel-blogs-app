const express = require("express");
const router = express.Router();
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const User = require('../models/user');
const ObjectId = require('mongodb').ObjectID;
const { $err, isLogedIn, checkCampgroundOwnership } = require('../middleware');


// index.page 📚👀
router.get('/', (req, res) => {
    Campground.find({}, (err, campgrounds) => {
        if (err) {
            $err(err);
            res.redirect('back');
        } else {
            res.render('campgrounds', { campgrounds, userPosts: false, foundUsername: undefined });
        }
    });
});

// user index.page 👨📚👀
router.get('/user/:user_id', (req, res) => {
    User.findById(req.params.user_id).then(({ username }) => {
        Campground.find({ "author.id": ObjectId(req.params.user_id) }, (err, campgrounds) => {
            if (err) {
                $err(err);
                res.redirect('back');
            } else {
                if (!username) {
                    req.flash('error', 'Sorry but user you are looking for does not exist');
                    res.redirect('/');
                } else {
                    res.render('campgrounds', { campgrounds, userPosts: true, foundUsername: username });
                }

            }
        });
    }).catch(() => {
        req.flash('error', 'Sorry but user you are looking for does not exist');
        res.redirect('/');
    })

});

// add new form ➕📘
router.get('/new', isLogedIn, (req, res) => {
    res.render('campgrounds/new');
});


// add new camp ➕📘✅
router.post('/', isLogedIn, (req, res) => {
    let { name, image, description } = req.body.campground;
    let { username, _id } = req.user;
    Campground.create({
        name,
        image,
        description,
        author: { username, id: _id }
    }, (err, campground) => {
        if (err) {
            $err(err);
        } else {
            res.redirect('/campgrounds');
        }
    });

});

// show camp 🖼👀
router.get('/:id', (req, res) => {
    let { id } = req.params;
    let loggedUser = !!req.user;
    Campground.findById(id).populate('comments').exec((err, campground) => {
        if (err) {
            $err(err);
            req.flash('error', 'Sorry but page you are looking for does not exist');
            res.redirect('back');
        } else {
            res.render('campgrounds/show', { campground, loggedUser });
        }
    });
});

// edit camp 🔧⚙️🖼
router.get('/:id/edit', checkCampgroundOwnership, (req, res) => {
    let { id } = req.params;
    Campground.findById(id).exec((err, campground) => {
        if (err) {
            $err(err);
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit', { campground });
    });
});

// edit camp 🔧⚙️🖼✅
router.put('/:id', checkCampgroundOwnership, (req, res) => {
    let { id } = req.params;
    let { name, image, description } = req.body.campground;
    Campground.findOneAndUpdate({ _id: id }, { name, image, description }, (err, campground) => {
        if (err) {
            $err(err);
            return res.redirect('/campgrounds');
        }
        res.redirect('/campgrounds/' + id);
    });
});

// deledt camp ❌🗑
router.delete('/:id', checkCampgroundOwnership, (req, res) => {
    let { id } = req.params;
    let comments = [];
    Campground.findById(id).exec((err, campground) => {
        if (err) {
            $err(err);
            return res.redirect('/campgrounds');
        }
        comments = campground.comments.map(comment => {
            return new Promise((resolve, reject) => {
                Comment.findOneAndDelete({ _id: comment._id }, err => {
                    if (err) {
                        $err(err);
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });
    });
    Promise.all(comments)
        .catch(err => {
            $err(err);
            return res.redirect('/campgrounds');
        })
        .then(() => {
            Campground.findOneAndDelete({ _id: id }, err => {
                if (err) {
                    $err(err);
                    return res.redirect('/campgrounds');
                }
                req.flash('error', 'Campground has been removed. 😢');
                res.redirect('/campgrounds/');
            });
        });

});



module.exports = router;
