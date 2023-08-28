const express = require("express");
const router = express.Router();

const {
  getAllCategories,
  getSingleCategory,
  createNewCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categories");

const isLogin = require("../middlewares/isLogin");

router.route("/").get(getAllCategories).post(isLogin, createNewCategory);

router
  .route("/:id")
  .get(getSingleCategory)
  .put(isLogin, updateCategory)
  .delete(isLogin, deleteCategory);

module.exports = router;
