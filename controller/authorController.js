const Author = require('../models/author');
const Book = require("../models/book");
const async = require("async");
const { body, validationResult } = require('express-validator');

// Display list of all Authors
exports.author_list = (req, res, next) => {
    Author.find()
    .sort({name: 1})
    .exec(function(err, list_authors) {
        if (err) {
            return next(err);
        }
        // successful, so render
        res.render("author_list", {
            title: "Author List",
            author_list: list_authors
        });
    });
};

// Display detail page for a specific Author
exports.author_detail = (req, res, next) => {
    async.parallel({
        author(callback) {
            Author.findById(req.params.id).exec(callback);
        },
        author_books(callback) {
            Book.find({ author: req.params.id }, "title summary").exec(callback);
        }
    },
    function(err, result) {
        if (err) {
            return next(err);
        }
        if (result.author == null) {
            const err = new Error("Author no found");
            err.status = 404;
            return next(err);
        }

        res.render("author_detail", {
            title: "Author Detail",
            author: result.author,
            author_books: result.author_books,
        });
    });
};

// Display Author create form on GET
exports.author_create_get = (req, res) => {
    res.render('author_form', { title: "Create Author" });
}

// Handle Author create form on POST
exports.author_create_post = [
    // Validate and sanitize fields.
    body('first_name').trim().isLength({min: 1}).escape()
        .withMessage('First name must be specified')
        .isAlphanumeric()
        .withMessage("First name has non-alphanumeric characters"),
    body('family_name').trim().isLength({min: 1}).escape()
        .withMessage('Family name must be specified')
        .isAlphanumeric()
        .withMessage("Family name has non-alphanumeric characters"),
    body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true})
        .isISO8601().toDate(),
    body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true})
        .isISO8601().toDate(),

    // Process request after validation and sanitization
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render("author_form", {
                title: "Create Author",
                author: req.body,
                errors: errors.array()
            });
            return;
        }

        // Data from form is valid.
        // Create an Author object with escaped and trimmed data.
        const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
        });

        author.save((err) => {
            if (err) {
                return next(err);
            }

            res.redirect(author.url);
        });
    }
];
// Display Author delete form on GET
exports.author_delete_get = (req, res, next) => {
    async.parallel({
        author(callback) {
            Author.findById(req.params.id).exec(callback);
        },
        author_books(callback) {
            Book.find({author: req.params.id}).exec(callback);
        }
    },
    (err, result) => {
        if (err) {
            return next(err);
        }

        if (result.author == null) {
            res.redirect("/catalog/authors");
        }

        res.render("author_delete", {
            title: "Delete Author",
            auhtor: result.author,
            author_books: result.author_books
        });
    });
}

// Handle Author delete on POST.
exports.author_delete_post = (req, res, next) => {
    async.parallel(
      {
        author(callback) {
          Author.findById(req.body.authorid).exec(callback);
        },
        authors_books(callback) {
          Book.find({ author: req.body.authorid }).exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        // Success
        if (results.authors_books.length > 0) {
          // Author has books. Render in same way as for GET route.
          res.render("author_delete", {
            title: "Delete Author",
            author: results.author,
            author_books: results.authors_books,
          });
          return;
        }
        // Author has no books. Delete object and redirect to the list of authors.
        Author.findByIdAndRemove(req.body.authorid, (err) => {
          if (err) {
            return next(err);
          }
          // Success - go to author list
          res.redirect("/catalog/authors");
        });
      }
    );
  };


// Display Author update form on GET.
exports.author_update_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Author delete GET");
}
  
// Handle Author update on POST.
exports.author_update_post = (req, res) => {
res.send("NOT IMPLEMENTED: Author update POST");
};