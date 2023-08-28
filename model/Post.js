const mongoose = require("mongoose");

// Create Post Schema
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Post description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Post category is required"],
    },
    numViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    disLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please Author is required"],
    },
    photo: {
      type: String,
      // required: [true, "Please add image is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Hook
PostSchema.pre(/^find/, function (next) {
  // Add Virtuals field to the post

  // Add viewsCount as a virtual field
  PostSchema.virtual("viewsCount").get(function () {
    const post = this;
    return post.numViews.length;
  });

  // Add likesCount as a virtual field
  PostSchema.virtual("likesCount").get(function () {
    const post = this;
    return post.likes.length;
  });

  // Add disLikesCount as a virtual field
  PostSchema.virtual("disLikesCount").get(function () {
    const post = this;
    return post.disLikes.length;
  });

  // Check the most liked post in percentage %
  PostSchema.virtual("likespercentage").get(function () {
    const post = this;
    const total = +post.likes.length + +post.disLikes.length; // Convert in into numbers e.g Number()
    const percentage = (post.likes.length / total) * 100;
    return `${percentage}%`;
  });

  // Check the most disliked post in percentage %
  PostSchema.virtual("disLikespercentage").get(function () {
    const post = this;
    const total = +post.disLikes.length + +post.disLikes.length; // Convert in into numbers e.g Number()
    const percentage = (post.disLikes.length / total) * 100;
    return `${percentage}%`;
  });

  // If days is less than 0 return today if days is 1 return yesterday else return days ago
  PostSchema.virtual("daysAgo").get(function () {
    const post = this;
    const date = new Date(post.createdAt);
    const daysAgo = Math.floor((Date.now() - date) / 86400000);
    return daysAgo === 0
      ? "Today"
      : daysAgo === 1
      ? "Yesterday"
      : `${daysAgo} Days Ago`;
  });

  next();
});

// Model
module.exports = mongoose.model("Post", PostSchema);
