const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require('../utils/ApiFeatures');
const User = require('../models/userModel');
const AppError = require("../utils/AppError");
const jwt = require('jsonwebtoken');

const getAllUsers = catchAsync(async (req, res, next) => {
  const apiFeatuers = new ApiFeatures(User.find({}), req.query)
                            .enableSearchByFieldFor('name', 'username', 'email')
                            .filter()
                            .sort()
                            .limitFields();
  const users = await apiFeatuers.query;

  res.status(200).json({
    status: 'success',
    length: users.length,
    data: {
      users
    }
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

const createSafeObject = (reqBody) => {
  const allowedModifictions = ['username', 'name'];
  const safeObj = {};
  Object.keys(reqBody).forEach(current => {
    if (allowedModifictions.includes(current))
      safeObj[current] = reqBody[current];
  });

  return safeObj;
}

const updateMe = catchAsync(async (req, res, next) => {
  /** user should not update the password using this router */
  if (req.body.password || req.body.confirmPassword || req.body.newPassword) {
    return next(new AppError(400, 'Please use the update or reset password functionality to update the password'));
  }

  /** Create safe object from request body */
  const safeObj = createSafeObject(req.body);

  const updatedUser = await User.findByIdAndUpdate(req.user._id, safeObj, {
    new: true,
    runValidators: true
  });

  /** Sign the token */
  const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  /** Send the token */
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: updatedUser
    }
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  console.log('Delete Me invoked');
  const user = req.user;
  user.active = false;
  await user.save({ validateBeforeSave: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser
    }
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  getAllUsers,
  getUser,
  updateMe,
  deleteMe,
  updateUser,
  deleteUser
};
