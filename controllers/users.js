const User = require("../model/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { appErrFunc, AppErrClass } = require("../utils/appError");
const Post = require("../model/Post");
const Comment = require("../model/Comment");
const Category = require("../model/Category");

// @desc        Register New User
// @routes      POST api/v1/users
// @access      Public
exports.registerUser = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    // Check if email exist
    const userFound = await User.findOne({ email });
    if (userFound) {
      // return next(appErrFunc("User/Email already exist", 400));
      return next(new AppErrClass("User/Email already exist", 400));
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    // console.log(salt);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new User
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashPassword,
    });

    res
      .status(200)
      .json({ success: true, result: "User Registered Successfully", user });
  } catch (error) {
    next(appErrFunc(error.message));
  }
};

// @desc        Login User
// @routes      POST api/v1/users
// @access      Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userFound = await User.findOne({ email });

    // Verify User Email
    if (!userFound) {
      return next(
        new AppErrClass("Invalid Credentials, Wrong, Email Not Found", 401)
      );
    }

    // Verify and Compare Password
    const isPasswordMatched = await bcrypt.compare(
      password,
      userFound.password
    );

    if (!userFound || !isPasswordMatched) {
      return next(
        new AppErrClass("Invalid Credentials, Password not matched", 401)
      );
    }

    res.status(200).json({
      success: true,
      result: "Login Successfully",
      data: {
        firstname: userFound.firstname,
        lastname: userFound.lastname,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: generateToken(userFound.id),
      },
    });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Get All Users
// @routes      GET api/v1/users
// @access      Public
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    // if (!users || users.length === 0) {
    //   return next(new AppErrClass("No users found", 401));
    // }

    // // Remove Password from each user object
    // const usersWithoutPssword = users.map((user) => {
    //   const { password, ...usersWithoutPssword } = user.toObject();
    //   // console.log(password);
    //   return usersWithoutPssword;
    // });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Get Single User Profile
// @routes      GET api/v1/users/profile
// @access      Public
exports.getSingleUserProfile = async (req, res, next) => {
  try {
    // console.log(req.userAuth);

    // const { id } = req.params;

    // const token = getTokenFromHeader(req);
    // console.log(token);

    const user = await User.findById(req.userAuth);
    // .populate({
    //   path: "posts",
    //   populate: {
    //   path : 'comments' ,
    //   }
    // });

    // Remove Password from user object
    // const { password, ...getUser } = user._doc;
    // console.log("User data", getUser, "Password hide", password);

    res.status(200).json({ success: true, user });
  } catch (error) {
    return next(appErrFunc(error.message));
    // return next(new AppErrClass("No users found", 401));
  }
};

// @desc        Update User info
// @routes      PUT api/v1/users/update-user
// @access      Private
exports.updateUser = async (req, res, next) => {
  try {
    const { email, firstname, lastname } = req.body;
    // Check if email is not taken
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return next(new AppErrClass(`Email ${email} already exists`, 409));
      }
    }

    // Update the user
    const user = await User.findByIdAndUpdate(
      req.userAuth,
      {
        firstname,
        lastname,
        email,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Updated Successfully", user });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Update User Password
// @routes      PUT api/v1/users/update-password
// @access      Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    // Check if user is updating the password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      // Update the user
      const user = await User.findByIdAndUpdate(
        req.userAuth,
        {
          password: hashPassword,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        success: true,
        message: "Password Updated Successfully",
        user,
      });
    } else {
      return next(new AppErrClass("Please enter a valid password", 403));
    }
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Delete User
// @routes      DELETE api/v1/users/delete-user
// @access      Private
exports.deleteUser = async (req, res, next) => {
  try {
    //1. Find the user to be deleted
    const userToDeleted = await User.findById(req.userAuth);

    // 2. Find all posts to be deleted
    await Post.deleteMany({ user: req.userAuth });

    // 3. Delete all comments of the user
    await Comment.deleteMany({ user: req.userAuth });

    // 4. Delete all category of the user
    await Category.deleteMany({ user: req.userAuth });

    // 5. User deleted successfully
    await userToDeleted.deleteOne();

    res.status(200).json({
      success: true,
      message: `User ${userToDeleted.firstname} ${userToDeleted.lastname} account delete`,
      userToDeleted,
    });
  } catch (error) {
    return next(appErrFunc(error.message));
    // return next(new AppErrClass("No users found", 401));
  }
};

// @desc        User Upload Profile Photo
// @routes      POST api/v1/users/profile-photo-upload/:id
// @access      Public
exports.profilePhototUpload = async (req, res, next) => {
  try {
    console.log(req.file);

    // 1. Find the user to be updated
    const userToUpdate = await User.findById(req.userAuth);

    // 2. Check if user is found
    if (!userToUpdate) {
      return next(appErrFunc("User not found", 404));
    }
    // 3. Check if a user is blocked
    if (userToUpdate.isBlocked) {
      return next(
        appErrFunc("Action not allowed, your account is blocked", 403)
      );
    }

    // 4. Check if a user is updating their profile photo
    if (req.file) {
      // 5. Update profile photo
      await User.findByIdAndUpdate(
        req.userAuth,
        {
          $set: {
            profilePhoto: req.file.path,
          },
        },
        {
          new: false,
        }
      );
      res.status(200).json({
        success: true,
        message: "You have successfully updated you Profile Photo",
      });
    }
  } catch (error) {
    return next(appErrFunc(error.message, 500));
  }
};

// @desc        Users viewd Profile Count
// @routes      GET api/v1/users/profile-viewers/:id
// @access      Public
exports.viewdProfileCount = async (req, res, next) => {
  try {
    // 1. Find the original
    const user = await User.findById(req.params.id);
    // console.log("User jis ke profile view honi hy", user);

    // 2. Find the user who viewed the original user
    const userWhoViewed = await User.findById(req.userAuth);
    // console.log("User jo profile view kary ga", userWhoViewed);

    // 3. Check the original and who viewed the profile are found
    if (user && userWhoViewed) {
      // 4. Check if userWhoViewed is already in users viewers array
      const isUserAlreadyViewed = user.viewers.find(
        (viewer) => viewer.toString() === userWhoViewed._id.toJSON()
      );

      if (isUserAlreadyViewed) {
        return next(appErrFunc("You already viewd this profile"));
      } else {
        // 5. Push the userWhoViewed to the user's viewers array
        user.viewers.push(userWhoViewed._id);

        // 6. Save the user
        await user.save();
        res.status(200).json({
          success: true,
          message: "You have successfully viewed this profile",
          user,
          userWhoViewed,
        });
      }
    }
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Following User
// @routes      GET api/v1/users/following-user/:id
// @access      Public
exports.followingUser = async (req, res, next) => {
  try {
    // 1. Find the User to follow
    const userToFollow = await User.findById(req.params.id);

    // 2. Find the User who is following
    const userWhoFollowed = await User.findById(req.userAuth);

    // 3. Check if both user (userToFollow, userWhoFollowed) are found
    if (userToFollow && userWhoFollowed) {
      // 4. Check if user "userWhoFollowed" is already follow the user "userToFollow" or in ther followers array
      const isUserAlreadyFollowed = userToFollow.followers.find(
        (follower) => follower.toString() === userWhoFollowed._id.toString()
      );

      if (isUserAlreadyFollowed) {
        return next(appErrFunc("You have already followed this user"));
      } else {
        // 5. Add the id of the user who is following into the userToFollow's following field
        // Push userWhoFollowed into the user's (userToFollow) followers array
        userToFollow.followers.push(userWhoFollowed._id);
        // Push userToFollow to the userWhoFollowed's following array
        userWhoFollowed.following.push(userToFollow._id);

        // 6. Save the updated user object and send it back as response
        await userToFollow.save();
        await userWhoFollowed.save();

        res.status(200).json({
          success: true,
          userWhoFollowed,
          message: "You have successfully following this user",
          userToFollow,
        });
      }
    }
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Un-Following User
// @routes      GET api/v1/users/unfollowing-user/:id
// @access      Public
exports.unFollowingUser = async (req, res, next) => {
  try {
    // 1. Find the User to un-followed
    const userToBeUnFollowed = await User.findById(req.params.id);

    // 2. Find the User who is un-following
    const userWhoUnFollowed = await User.findById(req.userAuth);

    // 3. Check if both user (userToBeUnFollowed, userWhoUnFollowed) are found
    if (userToBeUnFollowed && userWhoUnFollowed) {
      // 4. Check if user "userWhoUnFollowed" is not following the user "userToBeUnFollowed" or in ther followers array
      const isUserAlreadyFollowed = userToBeUnFollowed.followers.find(
        (follower) => follower.toString() === userWhoUnFollowed._id.toString()
      );

      if (!isUserAlreadyFollowed) {
        return next(appErrFunc("You have already unfollowed this user"));
      } else {
        // 5. Remove following field
        // Remove userWhoUnFollowed into the user's (userToBeUnFollowed) followers array
        userToBeUnFollowed.followers = userToBeUnFollowed.followers.filter(
          (follower) => follower.toString() !== userWhoUnFollowed._id.toString()
        );
        // Remove userToBeUnFollowed to the userWhoUnFollowed's following array
        userWhoUnFollowed.following = userWhoUnFollowed.following.filter(
          (following) =>
            following.toString() !== userToBeUnFollowed._id.toString()
        );

        // 6. Save the updated user object and send it back as response
        await userToBeUnFollowed.save();
        await userWhoUnFollowed.save();

        res.status(200).json({
          success: true,
          userWhoUnFollowed,
          message: "You have successfully UnFollowing this user",
          userToBeUnFollowed,
        });
      }
    }
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Block User
// @routes      GET api/v1/users/block-user/:id
// @access      Public
exports.blockUser = async (req, res, next) => {
  try {
    // 1. Find the User to be blocked
    const userToBeBlocked = await User.findById(req.params.id);

    // 2. Find the User who is blocking
    const userWhoBlocked = await User.findById(req.userAuth);

    // 3. Check if both user (userToBeBlocked, userWhoBlocked) are found
    if (userToBeBlocked && userWhoBlocked) {
      // 4. Check if user "userWhoBlocked" is already block the user "userToBeBlocked" or in ther blocked array
      const isUserAlreadyBlocked = userWhoBlocked.blocked.find(
        (blocked) => blocked.toString() === userToBeBlocked._id.toString()
      );

      if (isUserAlreadyBlocked) {
        return next(appErrFunc("You have already blocked this user"));
      } else {
        // 5. Push userToBeBlocked to the user's (userWhoBlocked) in blocked array
        userWhoBlocked.blocked.push(userToBeBlocked._id);

        // 6. Save the blocked user
        await userWhoBlocked.save();

        res.status(200).json({
          success: true,
          userWhoBlocked,
          message: "You have successfully Blocked this user",
          userToBeBlocked,
        });
      }
    }
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Un-Block User
// @routes      GET api/v1/users/unblock-user/:id
// @access      Public
exports.unBlockUser = async (req, res, next) => {
  try {
    // 1. Find the User to be unblocked
    const userToBeUnBlocked = await User.findById(req.params.id);

    // 2. Find the User who is unblocking
    const userWhoUnBlocked = await User.findById(req.userAuth);

    // 3. Check if both user (userToBeUnBlocked, userWhoUnBlocked) are found
    if (userToBeUnBlocked && userWhoUnBlocked) {
      // 4. Check if user "userToBeUnBlocked" is already in the array's of user "userWhoUnBlocked"
      const isUserAlreadyBlocked = userWhoUnBlocked.blocked.find(
        (blocked) => blocked.toString() === userToBeUnBlocked._id.toString()
      );

      if (!isUserAlreadyBlocked) {
        return next(appErrFunc("You have not blocked this user"));
      } else {
        // 5. Remove userToBeUnBlocked from the user's (userWhoUnBlocked) in blocked array
        userWhoUnBlocked.blocked = userWhoUnBlocked.blocked.filter(
          (blocked) => blocked.toString() !== userToBeUnBlocked._id.toString()
        );

        // 6. Save the unblocked user
        await userWhoUnBlocked.save();

        res.status(200).json({
          success: true,
          userWhoUnBlocked,
          message: "You have successfully UnBlocked this user",
          userToBeUnBlocked,
        });
      }
    }
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Admin Block User
// @routes      PUT api/v1/users/admin-block-user/:id
// @access      Private
exports.adminBlockUser = async (req, res, next) => {
  try {
    // 1. Find the User to be blocked by Admin
    const userToBeBlocked = await User.findById(req.params.id);

    // 2. Check if user (userToBeBlocked) is found
    if (!userToBeBlocked) {
      return next(appErrFunc("User Not found"));
    }

    // 3. Change the isBlocked in user model to TRUE
    userToBeBlocked.isBlocked = true;

    // 4. Save the Blocked user (Account)
    await userToBeBlocked.save();

    res.status(200).json({
      success: true,
      message: "You (Admin) have successfully Blocked this user",
      userToBeBlocked,
    });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Admin Un-Block User
// @routes      PUT api/v1/users/admin-unblock-user/:id
// @access      Private
exports.adminUnBlockUser = async (req, res, next) => {
  try {
    // 1. Find the User to be unblocked by Admin
    const userToBeUnBlocked = await User.findById(req.params.id);

    // 2. Check if user (userToBeUnBlocked) is not found
    if (!userToBeUnBlocked) {
      return next(appErrFunc("User Not found"));
    }

    // 3. Change the isBlocked in user model to FALSE
    userToBeUnBlocked.isBlocked = false;

    // 4. Save the unblocked user (Account)
    await userToBeUnBlocked.save();

    res.status(200).json({
      success: true,
      message: "You (Admin) have successfully UnBlocked this user",
      userToBeUnBlocked,
    });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};
