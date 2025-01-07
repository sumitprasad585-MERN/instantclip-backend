const catchAsync = require("../utils/catchAsync");
const User = require('../models/userModel');
const AppError = require("../utils/AppError");

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});
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
    const appError = new AppError(404, 'User not found');
    return next(appError);
  }
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

/** Admin route, Admins can modify any field of the user */
const updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

const filterAllowedModifications = (requestBody) => {
  const allowedModificationsForUser = ['username', 'name'];
  const safeObj = {};
  for (let key in requestBody) {
    if (allowedModificationsForUser.includes(key))
      safeObj[key] = requestBody[key];
  }
  return safeObj;
}

/** User Route, user can only update limited fields */
const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.newPassword) {
    const appError = new AppError(400, 'Please use the /updatePassword router to update the password');
    return next(appError);
  }

  const allowedModifications = filterAllowedModifications(req.body);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, allowedModifications, {
    runValidators: true,
    new: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

/** Admin route, Admin can delete the user */
const deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/** User route, User can request for deletion
 * The user would be made inactive stopping the user from logging in (GDPR non compliance)
 * Admins can delete the user from DB 
 */
const deleteMe = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.id, { active: false }, {
    runValidators: true,
    new: true
  });
  res.status(204).json({
    status: 'success',
    data: null
  })
});

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  updateMe,
  deleteUser,
  deleteMe
};
