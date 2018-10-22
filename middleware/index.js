const Campground = require('../models/campground');
const Comment = require('../models/comment');

const $err = console.log.bind(null, '😡⁉️');

const checkCampgroundOwnership = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('success', 'Please Login or Sign Up First!');
        res.redirect('back');
    }
    else {
        Campground.findById(req.params.id, (err, campground) => {
            if (err) {
                $err(err);
                req.flash('error', 'Sorry but page you are looking for does not exist.');
                res.redirect('back');
            }
            else {
                if (campground.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    req.flash('error', 'Sorry but you do not have permission for that action.');
                    res.redirect('back');
                }
            }
        });
    }
};
const checkCommentOwnership = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.redirect('back');
    }
    else {
        Comment.findById(req.params.comment_id, (err, comment) => {
            if (err) {
                $err(err);
                req.flash('error', 'Sorry but page you are looking for does not exist.');
                res.redirect('back');
            }
            else {
                if (comment.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    req.flash('error', 'Sorry but you do not have permission for that action.');
                    res.redirect('back');
                }
            }
        });
    }
};
const isLogedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('success', 'Please, Login or Sign Up First');
    res.redirect('/login');
};

module.exports = {
    checkCampgroundOwnership,
    checkCommentOwnership,
    isLogedIn,
    $err
};
