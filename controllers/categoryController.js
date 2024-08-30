const Category = require("../models/category");
const Item = require("../models/item")
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator")

// Display list of all Category.
exports.category_list = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Category list");
  const allCategories = await Category.find().sort({ name: 1 }).exec()
  res.render("category_list", {
    title: "Category List",
    category_list: allCategories
  })
});

// Display detail page for a specific Category.
exports.category_detail = asyncHandler(async (req, res, next) => {
   const [category, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name").exec()
  ])
  if (category === null) {
    const err = new Error("Category not found")
    err.status = 404
    return next(err)
  }

  res.render("category_detail", {
    title: "Category Detail",
    category: category,
    category_items: itemsInCategory,
  })
});

// Display Category create form on GET.
exports.category_create_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Category create GET");
  res.render("category_form", { title: "Create Category"})
});

// Handle Category create on POST.
exports.category_create_post = [
  body("name", "Category name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3})
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      })
      return
    } else {
      const categoryExists = await Category.findOne({ name: req.body.name })
        .collation({ localte: "en", strength: 2 })
        .exec()
      if (categoryExists) {
        res.redirect(categoryExists.url)
      } else {
        await category.save()
        res.redirect(category.url)
      }
    }
  })
]

// Display Category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Category delete GET");
  const [category, itemsInCategory] = await Promise.all([
    // first use Category.findById() to get Category information for a specific ID
    Category.findById(req.params.id).exec(),
    // Item.find() to get all books records  have that same assoicated category ID.
    Item.find({ category: req.params.id }, "name").exec()
  ])
  if (category === null) {
    const err = new Error("Category not found")
    err.status = 404
    return next(err)
  }

  res.render("category_delete", {
    title: "Category Detail",
    category: category,
    category_items: itemsInCategory,

  })
});

// Handle Category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Category delete POST");
  const [category, itemsInCategory] = await Promise.all([
    // first use Category.findById() to get Category information for a specific ID
    Category.findById(req.params.id).exec(),
    // Item.find() to get all books records  have that same assoicated category ID.
    Item.find({ category: req.params.id }, "name").exec()
  ])

  if (itemsInCategory.length > 0) {

    res.render("category_delete", {
      title: "Category Detail",
      category: category,
      category_items: itemsInCategory,
    })
  } else {
    await Category.findByIdAndDelete(req.body.categoryid)
    res.redirect("/catalog/categories")
  }
  
});

// Display Category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec()

  if(category === null) {
    const err = new Error("Category not found")
    err.status = 404
    return next(err)
  }

  res.render("category_form", { 
    title: "Update Category",
    category: category
  })
});

// Handle Category update on POST.
exports.category_update_post = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Category update POST");
  body("name", "Category name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3})
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    const category = new Category({
      name: req.body.name,
      _id: req.params.id
    })

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array(),
      })
      return
    } else {
        // await category.save()
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category)
        res.redirect(updatedCategory.url)
      }
    
  })
});
