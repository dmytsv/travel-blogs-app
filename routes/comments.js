const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const { $err, isLogedIn, checkCommentOwnership } = require('../middleware');


// chreate a new comment form ➕📂
router.get('/new', isLogedIn, (req, res) => {
    let { id } = req.params;
    Campground.findById(id).populate('comments').exec((err, campground) => {
        if (err) {
            $err(err);
            res.redirect('/campgrounds/');
        }
        else {
            res.render('comments/new', { campground });
        }
    });
});

// post a new comment ➕📂✅
router.post('/', isLogedIn, (req, res) => {

    let { id } = req.params;
    Campground.findById(id, (err, campground) => {
        if (err) {
            $err(err);
            res.redirect('/campgrounds');
        }
        else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    $err(err);
                }
                else {
                    let { username, _id } = req.user;
                    comment.author.id = _id;
                    comment.author.username = username;
                    comment.campground.id = id;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/' + id);
                }
            });
        }
    });
});

// edit comment ⚙️📂
router.get('/:comment_id/edit', checkCommentOwnership, (req, res) => {
    let campground = {
        _id: req.params.id,
    };
    Comment.findById(req.params.comment_id, (err, comment) => {
        if (err) {
            $err(err);
            res.redirect('back');
        }
        else {
            res.render('comments/edit', { campground, comment });
        }
    });

});

// edit comment  ⚙️📂✅
router.put('/:comment_id', checkCommentOwnership, (req, res) => {
    Comment.findOneAndUpdate({ _id: req.params.comment_id },
        req.body.comment,
        (err, comment) => {
            if (err) {
                $err(err);
                res.redirect('back');
            }
            else {
                res.redirect('/campgrounds/' + req.params.id);
            }
        });
});

// delete comment ❌🗑
router.delete('/:comment_id', checkCommentOwnership, (req, res) => {
    Comment.findOneAndDelete({ _id: req.params.comment_id }, err => {
        if (err) {
            $err(err);
            res.redirect('back');
        }
        else {
            req.flash('error', 'Comment has been removed. 😢');
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

module.exports = router;
