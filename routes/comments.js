const express = require("express");
const router = express.Router();

const {
  addNewComment,
  updateComment,
  deleteComment,
} = require("../controllers/comments");

const isLogin = require("../middlewares/isLogin");

router.route("/:id").post(isLogin, addNewComment);

router.put("/update-comment/:id", isLogin, updateComment);

router.delete("/delete-comment/:id", isLogin, deleteComment);

module.exports = router;
