const Category = require("../model/Category");
const { appErrFunc, AppErrClass } = require("../utils/appError");

// @desc        Get All Categories
// @routes      GET api/v1/categories
// @access      Public
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();

    res
      .status(200)
      .json({ success: true, count: categories.length, categories });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Get Single Category
// @routes      GET /api/v1/categories/:id
// @access      Public
exports.getSingleCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    // const category = await Category.findById(req.params.id).populate({
    //   path: "user",
    // });

    res.status(200).json({ success: true, category });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Create New Category
// @routes      POST /api/v1/categories
// @access      Public
exports.createNewCategory = async (req, res, next) => {
  try {
    const { title } = req.body;

    const category = await Category.create({
      title,
      user: req.userAuth,
    });

    // return next(
    //   new AppErrClass("Invalid Credentials, Password not matched", 401)
    // );

    res
      .status(200)
      .json({ success: true, result: "Created Successfully", category });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Update Category
// @routes      PUT /api/v1/categories/:id
// @access      Public
exports.updateCategory = async (req, res, next) => {
  try {
    const { title } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        title,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Updated Successfully", category });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};

// @desc        Delete Category
// @routes      DELETE /api/v1/categories/:id
// @access      Public
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ success: true, message: "Deleted Successfully", category });
  } catch (error) {
    return next(appErrFunc(error.message));
  }
};
