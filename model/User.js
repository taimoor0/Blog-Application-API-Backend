const mongoose = require("mongoose");
const Post = require("./Post"); // For Mongoose Hooks (Middlewares)

// Create User Schema
const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First name is required"],
    },
    lastname: {
      type: String,
      required: [true, "Second name is required"],
    },
    profilePhoto: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Guest", "Editor"],
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    plan: {
      type: String,
      enum: ["Free", "Premium", "Pro"],
      default: "Free",
    },
    userAward: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, //to get virtuals in json response from server to client
  }
);

// ==========>>>>>>>>>> Last Date User Created a Post <<<<<<<<<<==========
// ******************** Mongoose Hooks (Middlewares) ********************
// There are of two types
// 1-Type. post (after saving)

// 2-Type. pre (before record is save) // => find/findOne and others are used for pre methods
UserSchema.pre("findOne", async function (next) {
  // Populate the posts
  this.populate({
    path: "posts",
  });

  // 1. Get the User id
  const userId = this._conditions._id;

  // 2. Find the posts created by the user
  const posts = await Post.find({ user: userId });

  // 3. Get the last post created by the user
  const lastPost = posts[posts.length - 1];

  // 4. Get the last date user created a post
  const lastPostDate = new Date(lastPost?.createdAt);

  // 5. Get the last post date in string format
  const lastPostDateStr = lastPostDate.toDateString();

  // 6. Add virtuals to the user schema
  UserSchema.virtual("lastPostDate").get(function () {
    return lastPostDateStr;
  });

  // --------------- Check if user is inactive for 30 days ---------------
  // --------------- And System blocking user InActive for 30 days ---------------
  // 1. Get current Date
  const currentDate = new Date();

  //2. Get the difference between the last post date and the current date
  const difference = currentDate - lastPostDate;

  // 3. Get the differece in days and return the less than in days
  const differeceInDays = difference / (1000 * 3600 * 24);

  // 4. Add virtuals isInactive to the schema to check if a user is inactive for 30 days
  if (differeceInDays > 30) {
    UserSchema.virtual("isInActive").get(function () {
      return true;
    });

    // 5. Find the user by id and update
    await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
  } else {
    UserSchema.virtual("isInActive").get(function () {
      return false;
    });

    // 6. Find the user by id and update
    await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
  }

  // --------------- Last active date ---------------
  // 1. Convert to days ago, for example 1 day ago
  const daysAgo = Math.floor(differeceInDays);

  // 2. Add virtuals lastActive in days to the user schema
  UserSchema.virtual("lastActive").get(function () {
    // 3. Check if daysAgo is less than zero 0
    if (daysAgo <= 0) {
      return "Today";
    }

    // 4. Check if days equal to 1
    if (daysAgo === 1) {
      return "Yesterday";
    }

    // 5. Check if daysAgo is greater than 1
    if (daysAgo > 1) {
      return `${daysAgo} days ago`;
    }
  });

  // --------------- Update userAward based on the number of posts ---------------
  // 1. Get the number of posts
  const numOfPosts = posts.length;

  // 2. Check if the number of posts is less than 10
  if (numOfPosts < 10) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: "Bronze",
      },
      {
        new: true,
      }
    );
  }

  // 3. Check if the number of posts is greater than 10
  if (numOfPosts > 10) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: "Silver",
      },
      {
        new: true,
      }
    );
  }

  // 4. Check if the number of posts is greater than 20
  if (numOfPosts > 20) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: "Gold",
      },
      {
        new: true,
      }
    );
  }

  next();
});

// ******************** Virtuals Property ********************
// Get Fullname
UserSchema.virtual("fullname").get(function () {
  return `${this.firstname} ${this.lastname}`;
});

// Get User initials
UserSchema.virtual("initials").get(function () {
  return `${this.firstname[0]}${this.lastname[0]}`;
});

// Get posts count
UserSchema.virtual("postCounts").get(function () {
  return this.posts.length;
});

// Get Viewers count
UserSchema.virtual("viewerCounts").get(function () {
  return this.viewers.length;
});

// Get Following count
UserSchema.virtual("followingCounts").get(function () {
  return this.following.length;
});

// Get Followers count
UserSchema.virtual("followerCounts").get(function () {
  return this.followers.length;
});

// Get Block count
UserSchema.virtual("blockCounts").get(function () {
  return this.blocked.length;
});

// Model
const User = mongoose.model("User", UserSchema);
module.exports = User;
