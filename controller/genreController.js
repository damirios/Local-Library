const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");
const mongoose = require("mongoose");
const { body, validationResult } = require('express-validator');


// Display list of all Genre.
exports.genre_list = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  Genre.find()
  .sort({name: 1})
  .exec(function(err, list_genre) {
    if (err) {
      next(err);
    }
    // successful, so render
    res.render("genre_list", {
      title: 'Genre List',
      genre_list: list_genre
    });
  });
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  async.parallel({
    genre(callback) {
      Genre.findById(req.params.id).exec(callback);
    },

    genre_books(callback) {
      Book.find({ genre: req.params.id }).exec(callback);
    },
  },
  function(err, result) {
    if (err) {
      return next(err);
    }
    if (result.genre == null) {
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }

    res.render("genre_detail", {
      title: "Genre Detail",
      genre: result.genre,
      genre_books: result.genre_books
    });
  });
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
  res.render('genre_form', { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),
  
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    // if there are errors render form again with sanitized values/error messages
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array()
      });
      return;
    } else {
      // data from form is valid. Check if Genre with same name exists.
      Genre.findOne( {name: req.body.name} ).exec(function(err, found_genre) {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(genre.url);
          });
        }
      });
    }
  }];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete GET");
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete POST");
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
};

// Handle Genre update on POST.
exports.genre_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
};
