const mongoose = require("mongoose");

// Create Comment Schema
const CommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required"],
    },
    user: {
      type: Object,
      ref: "Post",
      required: [true, "User is required"],
    },
    description: {
      type: String,
      required: [true, "Comment description is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = mongoose.model("Comment", CommentSchema);
