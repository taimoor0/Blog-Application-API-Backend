const Comment = require("../model/Comment");
const Post = require("../model/Post");
const User = require("../model/User");
const { appErrFunc, AppErrClass } = require("../utils/appError");

// @desc        Add New Comment
// @routes      POST /api/v1/comments/:id
// @access      Public
exports.addNewComment = async (req, res, next) => {
  try {
    const { description } = req.body;

    // Find the post
    const post = await Post.findById(req.params.id);

    // Create comment
    const comment = await Comment.create({
      post: post._id,
      description,
      user: req.userAuth,
    });

    // Push the comment to post
    post.comments.push(comment._id);

    // Find the user
    const user = await User.findById(req.userAuth);

    // Push the comment to user
    user.comments.push(comment._id);

    // Save
    await user.save({ validateBeforeSave: false });
    await post.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Comment is this",
      comment: comment,
      message: "Comment is added to user",
      user: user,
      message: "Comment is added to a post",
      post: post,
    });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Update Comment
// @routes      PUT /api/v1/comments/update-comment/:id
// @access      Private
exports.updateComment = async (req, res, next) => {
  try {
    const { description } = req.body;

    // Find the comment
    const comment = await Comment.findById(req.params.id);

    // Check if the comment belongs to the user
    if (comment.user.toString() !== req.userAuth.toString()) {
      return next(
        appErrFunc(
          "Access denied, You are not allowed to update this comment",
          403
        )
      );
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        description,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Updated Successfully", updatedComment });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Delete Comment
// @routes      DELETE /api/v1/comments/:id
// @access      Public
exports.deleteComment = async (req, res, next) => {
  try {
    // Find the comment
    const comment = await Comment.findById(req.params.id);

    // Check if the comment belongs to the user
    if (comment.user.toString() !== req.userAuth.toString()) {
      return next(
        appErrFunc(
          "Access denied, You are not allowed to delete this comment",
          403
        )
      );
    }

    const deleteComment = await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Comment has been deleted",
      deleteComment,
    });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};
