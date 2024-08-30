#! /usr/bin/env node

console.log(
  'This script populates some test items, authors, categories and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.cojoign.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0"'
);

const Item = require("../models/item");
const Category = require("../models/category");

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
    categoryCreate(0, "Action figures"),
    categoryCreate(1, "Animals"),
    categoryCreate(2, "Cars and raido controlled"),
    categoryCreate(3, "Construction toys"),
    categoryCreate(4, "Creative toys"),
    categoryCreate(5, "Dolls"),
    categoryCreate(6, "Eductional toys"),
    categoryCreate(7, "Eletronic toys"),
    categoryCreate(8, "Office toys"),
    categoryCreate(9, "Food-related toys"),
    categoryCreate(10, "Games"),
  ]);
}

async function createItems() {
  console.log("Adding Items");
  await Promise.all([
    // Action figures
    itemCreate(0,"Army men",[categories[0]]),
    itemCreate(1,"B-Daman",[categories[0]]),
    itemCreate(2,"Bakugan",[categories[0]]),

    // Animals
    itemCreate(3,"Breyer Animal Creations",[categories[1]]),
    itemCreate(4,"Filly",[categories[1]]),
    itemCreate(5,"Ithaca Kitty",[categories[1]]),

    // Cars and radio controlled
    itemCreate(6,"Corgi",[categories[2]]),
    itemCreate(7,"Cozy Coupe",[categories[2]]),
    itemCreate(8,"Didicar",[categories[2]]),

    // Construction toys
    itemCreate(9,"Erector Set",[categories[3]]),
    itemCreate(10,"K'Nex",[categories[3]]),
    itemCreate(11,"Lego",[categories[3]]),

    // Creative toys
    itemCreate(12,"Cleversticks",[categories[4]]),
    itemCreate(13,"Colorforms",[categories[4]]),
    itemCreate(14,"Crayola Crayons",[categories[4]]),

    // Dolls
    itemCreate(15,"African dolls",[categories[5]]),
    itemCreate(16,"American Girl",[categories[5]]),
    itemCreate(17,"Amish doll",[categories[5]]),

    // Educational toys
    itemCreate(18,"Ant Farm",[categories[6]]),
    itemCreate(19,"Lego Mindstorms",[categories[6]]),
    itemCreate(20,"Lego Mindstorms NXT",[categories[6]]),

    // Electronic toys
    itemCreate(21,"Amiibo",[categories[7]]),
    itemCreate(22,"Digital pet",[categories[7]]),
    itemCreate(23,"Entertainment robot",[categories[7]]),

    // Office toys
    itemCreate(24,"Drinking bird",[categories[8]]),
    itemCreate(25,"Fidget Spinner",[categories[8]]),
    itemCreate(26,"Magic 8-Ball",[categories[8]]),

    // Food-related toys
    itemCreate(27,"Easy-Bake Oven",[categories[9]]),
    itemCreate(28,"Pez dispenser",[categories[9]]),
    itemCreate(29,"Snow cone machine",[categories[9]]),

    // Games
    itemCreate(30,"Atari 2600",[categories[10]]),
    itemCreate(31,"Barrel O' Monkeys",[categories[10]]),
    itemCreate(32,"Battleship",[categories[10]]),
  ]);
}
