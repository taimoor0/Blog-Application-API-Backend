const Post = require("../model/Post");
const User = require("../model/User");
const { appErrFunc, AppErrClass } = require("../utils/appError");

// @desc        Get All Posts
// @routes      GET api/v1/posts
// @access      Public
exports.getAllPosts = async (req, res, next) => {
  try {
    // 1. Find all posts
    const posts = await Post.find({})
      .populate("user")
      .populate("category", "title");

    // 2. Check if the user is blocked by the post owner
    const filteredPosts = posts.filter((post) => {
      // console.log(post);

      // 3. Get all blocked users
      const blockedUsers = post.user.blocked;
      // console.log(blockedUsers);

      const isBlocked = blockedUsers.includes(req.userAuth);
      // console.log(isBlocked);

      // 4. Return the post if user is not blocked either it give null
      return isBlocked ? null : post;
      // return !isBlocked
    });

    res.status(200).json({
      success: true,
      countTotal: posts.length,
      countFilter: filteredPosts.length,
      data: filteredPosts,
    });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Get Single Post
// @routes      GET /api/v1/posts/:id
// @access      Public
exports.getSinglePost = async (req, res, next) => {
  try {
    // Find the post
    const post = await Post.findById(req.params.id);

    // --------------- Number of views ---------------

    // 1. Check if the user viewed the post
    const isViewed = post.numViews.includes(req.userAuth);
    if (isViewed) {
      res.status(200).json({ success: true, post });
    } else {
      // 2. Push the user into numViews
      post.numViews.push(req.userAuth);

      // 3. Save the numViews into DB of post
      await post.save();

      res.status(200).json({ success: true, post });
    }
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Create New Post
// @routes      POST /api/v1/posts
// @access      Private
exports.CreateNewPost = async (req, res, next) => {
  try {
    console.log(req.file);
    const { title, description, category } = req.body;

    // 1.Find the user
    const author = await User.findById(req.userAuth);

    // Check if the user is block
    if (author.isBlocked) {
      return next(appErrFunc("Access denied, You account is blocked", 403));
    }

    // 2. Create the post
    const postCreated = await Post.create({
      title,
      description,
      category,
      // photo: req && req.file && req.file.path,
      photo: req?.file?.path,
      user: author._id,
    });

    // 3. Associate user to a post -Push the post into the user posts field
    author.posts.push(postCreated);

    // 4. Save the post in the user
    await author.save();

    res.status(200).json({
      success: true,
      message: "Post is created and added in user",
      postCreated,
      // user: "User is",
      // author,
    });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Update User
// @routes      PUT /api/v1/posts/update-post/:id
// @access      Public
exports.updatePost = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    // Find the post
    const post = await Post.findById(req.params.id);

    // Check if the post belongs to the user
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(
        appErrFunc(
          "Access denied, You are not allowed to update this post",
          403
        )
      );
    }

    const postUpdated = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title,
          description,
          category,
          photo: req?.file?.path,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Post is Updated successfully",
      postUpdated,
    });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Delete Post
// @routes      DELETE /api/v1/posts/delete-post/:id
// @access      Public
exports.deletePost = async (req, res, next) => {
  try {
    // Find the post
    const post = await Post.findById(req.params.id);

    // Check if the post belongs to the user
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(
        appErrFunc(
          "Access denied, You are not allowed to delete this post",
          403
        )
      );
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Post is deleted successfully",
      post,
    });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        User Likes a Posts
// @routes      GET /api/v1/posts/likes-posts/:id
// @access      Public
exports.userLikesPosts = async (req, res, next) => {
  try {
    // 1. Get the post
    const post = await Post.findById(req.params.id);

    // 2. Check if the user has already liked the post
    const isLiked = post.likes.includes(req.userAuth);

    // 3. If the user has already liked the post, unlike the post
    if (isLiked) {
      // post.likes = post.likes.filter((like) => like != req.userAuth);
      post.likes = post.likes.filter(
        (like) => like.toString() !== req.userAuth.toString()
      );

      // 4. Save the updated post to the database
      await post.save();
    } else {
      // 5. If the user has not liked the post, like the post
      post.likes.push(req.userAuth);

      // 6. Save the updated post to the database
      await post.save();
    }

    res.status(200).json({
      success: true,
      message: "You have successfully Like this Post",
      data: post,
    });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        User DisLikes a Posts
// @routes      GET /api/v1/posts/dislikes-posts/:id
// @access      Public
exports.userDisLikesPosts = async (req, res, next) => {
  try {
    // 1. Get the post
    const post = await Post.findById(req.params.id);

    // 2. Check if the user has already unliked the post
    const isUnLiked = post.disLikes.includes(req.userAuth);

    // 3. If the user has already disliked the post, remove it from the dislike
    if (isUnLiked) {
      // post.disLikes = post.disLikes.filter((disLike) => disLike != req.userAuth);
      post.disLikes = post.disLikes.filter(
        (disLike) => disLike.toString() !== req.userAuth.toString()
      );

      // 4. Save the updated post to the database
      await post.save();
    } else {
      // 5. If the user has not disliked the post, dislike the post
      post.disLikes.push(req.userAuth);

      // 6. Save the updated post to the database
      await post.save();
    }

    res.status(200).json({
      success: true,
      message: "You DisLike the Post",
      data: post,
    });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};
