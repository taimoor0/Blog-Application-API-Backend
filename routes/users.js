const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../config/cloudinary");

const {
  registerUser,
  loginUser,
  getAllUsers,
  getSingleUserProfile,
  updateUser,
  updatePassword,
  deleteUser,
  profilePhototUpload,
  viewdProfileCount,
  followingUser,
  unFollowingUser,
  blockUser,
  unBlockUser,
  adminBlockUser,
  adminUnBlockUser,
} = require("../controllers/users");

const isLogin = require("../middlewares/isLogin");
const isAdmin = require("../middlewares/isAdmin");

// Instance of multer
const upload = multer({ storage });

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/", getAllUsers);
router.get("/profile", isLogin, getSingleUserProfile);

router.put("/update-user", isLogin, updateUser);
router.put("/update-password", isLogin, updatePassword);

router.delete("/delete-user", isLogin, deleteUser);

router.post(
  "/profile-photo-upload",
  isLogin,
  upload.single("profile"),
  profilePhototUpload
);

router.get("/profile-viewers/:id", isLogin, viewdProfileCount);

router.get("/following-user/:id", isLogin, followingUser);
router.get("/unfollowing-user/:id", isLogin, unFollowingUser);

router.get("/block-user/:id", isLogin, blockUser);
router.get("/unblock-user/:id", isLogin, unBlockUser);

router.put("/admin-block-user/:id", isLogin, isAdmin, adminBlockUser);
router.put("/admin-unblock-user/:id", isLogin, isAdmin, adminUnBlockUser);

module.exports = router;
