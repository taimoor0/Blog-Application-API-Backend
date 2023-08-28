const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../config/cloudinary");

const {
  getAllPosts,
  getSinglePost,
  CreateNewPost,
  updatePost,
  deletePost,
  userLikesPosts,
  userDisLikesPosts,
} = require("../controllers/posts");

const isLogin = require("../middlewares/isLogin");

// File upload middleware
const upload = multer({ storage });

router
  .route("/")
  .get(isLogin, getAllPosts)
  .post(isLogin, upload.single("image"), CreateNewPost);

router.get("/:id", isLogin, getSinglePost);

router.put("/update-post/:id", upload.single("image"), isLogin, updatePost);
router.delete("/delete-post/:id", isLogin, deletePost);

router.get("/likes-posts/:id", isLogin, userLikesPosts);
router.get("/dislikes-posts/:id", isLogin, userDisLikesPosts);

module.exports = router;
