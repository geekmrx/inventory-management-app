const Item = require("../models/item");
const Category = require("../models/category");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  const [
    numItems,
    numCategories,
  ] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Inventory Home",
    item_count: numItems,
    category_count: numCategories,
  });

});

// Display list of all books.
exports.item_list = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Item list");
  // O route handler usa await para esperar a promise, pausando a execução até que seja resolvida.
  // Se a promise for cumprida, os results da query serão salvos no allItems variable e o handler continua execução.
  const  allItems = await Item.find({}, "name")
    .sort({ name: 1 })
    // .populate("author") // replace the sotred item author id with the full author details.
    .exec() // execute the query and return a promise
    res.render("item_list", { name: "Item List", item_list: allItems })
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: Item detail: ${req.params.id}`);
  // Promise.all() to query the specfied Item and its associated copies BookInstace in parallel.
  const [item] = await Promise.all([
    Item.findById(req.params.id).populate("name").populate("category").exec(),
  ])

  // If no matching item is found an Error object is returned with a "404: Not Found" error.
  if (item === null) {
    const err = new Error("Item not found")
    err.status = 404
    return next(err)
  }

  // If the item is found, as database information recuperadas serão renderizadas usando o "item_detail" template.
  res.render("item_detail", {
    name: item.name,
    item: item,
  })
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const [allCategories] = await Promise.all([
    Category.find().sort({ name: 1 }).exec()
  ])

  res.render("item_form", {
    name: "Create Item",
    categories: allCategories,
  })
});

// Handle item create on POST.
exports.item_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category = 
        typeof req.body.category === "undefined" ? [] : [req.body.category]
    }
    next()
  },

  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    const item = new Item({
      name: req.body.name,
      category: req.body.category,
    })

    if (!errors.isEmpty()) {
      const [allCategories] = await Promise.all([
        Category.find().sort({ name: 1}).exec()
      ])
      
      for (const category of allCategories) {
        if (item.category.includes(category._id)) {
          category.checked = "true"
        }
      }
      res.render("item_form", {
        name: "Create Item",
        categories: allCategories,
        item: item,
        errors: errors.array()
      })
    } else {
      await item.save()
      res.redirect(item.url)
    }
  })
]

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Item delete GET");
  const [item] = await Promise.all([
    Item.findById(req.params.id).populate("name").populate("category").exec(),
  ])

  if (item === null) res.redirect("/catalog/items")

  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  })
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Item delete POST");
  const [item] = await Promise.all([
    Item.findById(req.params.id).populate("name").populate("category").exec(),
  ])

  res.render("item_delete", {
    name: "Delete  Delete",
    item: item,
  })

  await Item.findByIdAndDelete(req.body.itemid)
  res.redirect("/catalog/items")
  
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate("name").exec(),
    Category.find().sort({ name: 1 }).exec()
  ])

  if (item === null) {
    const err = new Error("Item not found")
    err.status = 404
    return next(err)
  }
  
  allCategories.forEach((category) => {
    if (item.category.includes(category._id)) category.checked = "true"
  })

  res.render("item_form", {
    name: "Update Item",
    categories: allCategories,
    item: item
  })
});

// Handle item update on POST.
exports.item_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category = typeof req.body.category === "undefined" ? [] : [req.body.category]
    }
    next()
  },

  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    const item = new Item({
      name: req.body.name,
      category: typeof req.body.category === "undefined" ? [] : req.body.category,
      _id: req.params.id
    })

    if (!errors.isEmpty()) {
      const [allCategories] = await Promise.all([
        Category.find().sort({ name: 1 }).exec()
      ])

      for (const category of allCategories) {
        if (item.category.indexOf(category._id) > -1) {
          category.checked = "true"
        }
      }
      res.render("item_form", {
        name: "Update Item",
        categories: allCategories,
        item: item,
        errors: errors.array()
      })
      return
    } else {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {})
      res.redirect(updatedItem.url)
    }
  })
]
