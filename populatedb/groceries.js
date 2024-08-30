#! /usr/bin/env node

console.log(
  'This script populates some test items, authors, categories and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.cojoign.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0"'
);

const Item = require("./models/item");
const Category = require("./models/category");

const categories = [];
const items = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect("mongodb://mongo:27017/inventory");
  console.log("Debug: Should be connected?");
  await createCategories();
  await createItems();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// category[0] will always be the Fantasy category, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name) {
  const category = new Category({ name: name });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function itemCreate(index, name, category) {
  const itemdetail = {
    name: name,
  };
  if (category != false) itemdetail.category = category;

  const item = new Item(itemdetail);
  await item.save();
  items[index] = item;
  console.log(`Added item: ${name}`);
}

async function createCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate(0, "Dry goods"),
    categoryCreate(1, "Liquid and wet goods"),
    categoryCreate(2, "Household good"),
  ]);
}

async function createItems() {
  console.log("Adding Items");
  await Promise.all([
    itemCreate(
      0,
      "Beans",
      [categories[0]]
    ),
    itemCreate(
      1,
      "Candy",
      [categories[0]]
    ),
    itemCreate(
      2,
      "Cookies",
      [categories[0]]
    ),
    itemCreate(
      3,
      "Honey",
      [categories[1]]
    ),
    itemCreate(
      4,
      "Cooking oils",
      categories[1]
    ),
    itemCreate(
      5,
      "Rice",
      [ categories[0]]
    ),
    itemCreate(
      6,
      "Dish detergent",
      [ categories[2]]
      
    ),
    itemCreate(
      6,
      "Laundry detergent",
      [ categories[2]]
    ),
  ]);
}
