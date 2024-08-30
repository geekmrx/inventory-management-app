const Genre = require("../models/genre");
const Book = require("../models/book")
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator")

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Genre list");
  const allGenres = await Genre.find().sort({ name: 1 }).exec()
  res.render("genre_list", {
    title: "Genre List",
    genre_list: allGenres
  })
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: Genre detail: ${req.params.id}`);
  // Promise.all() to run the database queries in parallel
  // await na returned promise
  // if the genre does not exist in the database então return successfully with no results
  const [genre, booksInGenre] = await Promise.all([
    // first use Genre.findById() to get Genre information for a specific ID
    Genre.findById(req.params.id).exec(),
    // Book.find() to get all books records  have that same assoicated genre ID.
    Book.find({ genre: req.params.id }, "title summary").exec()
  ])
  if (genre === null) {
    const err = new Error("Genre not found")
    err.status = 404
    return next(err)
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  })
});

// Display Genre create form on GET.
exports.genre_create_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Genre create GET");
  res.render("genre_form", { title: "Create Genre"})
});

// Handle Genre create on POST.
exports.genre_create_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3})
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      })
      return
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ localte: "en", strength: 2 })
        .exec()
      if (genreExist) {
        res.redirect(genreExists.url)
      } else {
        await genre.save()
        res.redirect(genre.url)
      }
    }
  })
]

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Genre delete GET");
  const [genre, booksInGenre] = await Promise.all([
    // first use Genre.findById() to get Genre information for a specific ID
    Genre.findById(req.params.id).exec(),
    // Book.find() to get all books records  have that same assoicated genre ID.
    Book.find({ genre: req.params.id }, "title summary").exec()
  ])
  if (genre === null) {
    const err = new Error("Genre not found")
    err.status = 404
    return next(err)
  }

  res.render("genre_delete", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,

  })
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Genre delete POST");
  const [genre, booksInGenre] = await Promise.all([
    // first use Genre.findById() to get Genre information for a specific ID
    Genre.findById(req.params.id).exec(),
    // Book.find() to get all books records  have that same assoicated genre ID.
    Book.find({ genre: req.params.id }, "title summary").exec()
  ])

  if (booksInGenre.length > 0) {

    res.render("genre_delete", {
      title: "Genre Detail",
      genre: genre,
      genre_books: booksInGenre,
    })
  } else {
    await Genre.findByIdAndDelete(req.body.genreid)
    res.redirect("/catalog/genres")
  }
  
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Genre update GET");
  const [genre] = await Promise.all([
    // first use Genre.findById() to get Genre information for a specific ID
    Genre.findById(req.params.id).exec(),
  ])
  res.render("genre_form", { 
    title: "Update Genre",
    genre: genre
  })
});

// Handle Genre update on POST.
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Genre update POST");
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3})
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update Genre",
        genre: genre,
        errors: errors.array(),
      })
      return
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ localte: "en", strength: 2 })
        .exec()
      if (genreExist) {
        res.redirect(genreExists.url)
      } else {
        // await genre.save()
        const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, )
        res.redirect(genre.url)
      }
    }
  })
});
