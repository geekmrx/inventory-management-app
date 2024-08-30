const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bookinstance = require("../models/bookinstance");

exports.index = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Site Home Page");
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({ status: "Available" }).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Local Library Home",
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  });

});

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Book list");
  // O route handler usa await para esperar a promise, pausando a execução até que seja resolvida.
  // Se a promise for cumprida, os results da query serão salvos no allBooks variable e o handler continua execução.
  const  allBooks = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author") // replace the sotred book author id with the full author details.
    .exec() // execute the query and return a promise
    res.render("book_list", { title: "Book List", book_list: allBooks })
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: Book detail: ${req.params.id}`);
  // Promise.all() to query the specfied Book and its associated copies BookInstace in parallel.
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec()
  ])

  // If no matching book is found an Error object is returned with a "404: Not Found" error.
  if (book === null) {
    const err = new Error("Book not found")
    err.status = 404
    return next(err)
  }

  // If the book is found, as database information recuperadas serão renderizadas usando o "book_detail" template.
  res.render("book_detail", {
    title: book.title,
    book: book,
    book_instances: bookInstances,
  })
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  const [allAuthors, allGenres] = await Promise.all([
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec()
  ])

  res.render("book_form", {
    title: "Create Book",
    authors: allAuthors,
    genres: allGenres,
  })
});

// Handle book create on POST.
exports.book_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = 
        typeof req.body.genre === "undefined" ? [] : [req.body.genre]
    }
    next()
  },

  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    })

    if (!errors.isEmpty()) {
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1}).exec()
      ])
      
      for (const genre of allGenres) {
        if (book.genre.includes(genre._id)) {
          genre.checked = "true"
        }
      }
      res.render("book_form", {
        title: "Create Book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array()
      })
    } else {
      await book.save()
      res.redirect(book.url)
    }
  })
]

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Book delete GET");
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec()
  ])

  if (book === null) res.redirect("/catalog/book")

  res.render("book_delete", {
    title: "Delete Book",
    book: book,
    book_instances: bookInstances
  })
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Book delete POST");
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec()
  ])

  if (bookinstance.length > 0) {
    res.render("book_delete", {
      title: "Delete  Delete",
      book: book,
      bookinstances: bookInstances
    })
    return
  } else {
    await Book.findByIdAndDelete(req.body.bookid)
    res.redirect("/catalog/book")
  }
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  const [book, allAuthors, allGenres] = await Promise.all([
    Book.findById(req.params.id).populate("author").exec(),
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec()
  ])

  if (book === null) {
    const err = new Error("Book not found")
    err.status = 404
    return next(err)
  }
  
  allGenres.forEach((genre) => {
    if (book.genre.includes(genre._id)) genre.checked = "true"
  })

  res.render("book_form", {
    title: "Update Book",
    authors: allAuthors,
    genres: allGenres,
    book: book
  })
});

// Handle book update on POST.
exports.book_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === "undefined" ? [] : [req.body.genre]
    }
    next()
  },

  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("genre.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id
    })

    if (!errors.isEmpty()) {
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec()
      ])

      for (const genre of allGenres) {
        if (book.genre.indexOf(genre._id) > -1) {
          genre.checked = "true"
        }
      }
      res.render("book_form", {
        title: "Update Book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array()
      })
      return
    } else {
      const updatedBook = await Book.findByIdAndUpdate(req.params.id, book, {})
      res.redirect(updatedBook.url)
    }
  })
]
