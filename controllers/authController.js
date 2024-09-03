const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/AppError');
const { promisify } = require('util');
const sendMail = require('../utils/mail');
const crypto = require('crypto');

const signup = catchAsync(async (req, res, next) => {

  /** Take only required fields from request body and create user in db 
   * The password would be hashed through pre-save hook
  */
 const { name, username, email, password, confirmPassword } = req.body;
  const user = await User.create({
    name,
    username,
    email,
    password,
    confirmPassword
  });

  /** Sign the token */
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  /** Send the token */
  user.password = undefined;
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

const login = catchAsync(async (req, res, next) => {
  /** Find the user based on username or email */
  const { username, email } = req.body;
  const user = await User.findOne({$or: [{username}, {email}]}).select('+password');

  /** Validate the user password only if the user is found */
  let correct = false;
  if (user && req.body.password) {
    correct = await user.verifyPassword(req.body.password, user.password);
  }

  if (!user || !correct) {
    return next(new AppError(400, 'Invalid Credentials'));
  }

  /** Sign the token */
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  /** Send the token */
  res.status(200).json({
    status: 'success',
    token
  });
});

const protect = catchAsync(async (req, res, next) => {
  /** Extract the bearer token */
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return next(new AppError(401, 'You are not logged in. Please log in'));
  }

  /** Validate the token */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  /** Check if user still exists in the db and not deleted */
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError(401, 'User Deleted'));
  }

  /** Check if password was changed post issuing the token */
  let passwordWasChanged = user.didPasswordChange(decoded.iat);
  if (passwordWasChanged) {
    return next(new AppError(401, 'Password was changed. Please login with new password'));
  }

  /** Grant access to protected route by calling the next middleware in the middleware stack */
  req.user = user;
  next();
});

const forgotPassword = catchAsync(async (req, res, next) => {
  /** Find the user based on email */
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(404, 'No user found with that email'));
  }

  /** Create the password reset token for the user */
  const resetToken = user.createPasswordResetToken();
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  /** Send the reset token to user on mail */
  const subject = 'Reset Your Password | Valid for 1 Hour ⏰'
  const text = `Forgot your password? Just send a PATCH request to ${req.get('host')}/api/v1/users/resetPassword/${resetToken} with the new password. Link valid for 1 hour. Please ignore if already done or not triggered by you`;
  try {
    await sendMail({
      to: user.email,
      subject,
      text
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(500, 'An error occurred while sending mail'));
  }

  /** Send the response to user */
  res.status(200).json({
    status: 'success',
    message: 'Password reset link sent to user mail'
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  /** Find the user based on reset token  */
  const { resetToken } = req.params;

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetTokenExpiresAt: {$gt: Date.now()} });
  if (!user) {
    return res.status(400).json({
      status: 'fail',
      message: 'Token Expired or Invalid Token'
    });
  }

  /** Save the new password and remove reset token */
  const { password, confirmPassword } = req.body;
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;

  await user.save();

  /** Sign the token */
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  /** Send the token */
  res.status(200).json({
    status: 'success',
    token
  });
});

const updatePassword = catchAsync(async (req, res, next) => {

  /** user is already authenticated, validate the current password and update the new password
   * if credentials are correct
   */
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new AppError(400, 'Please enter currentPassword, newPassword, and confirmNewPassword'));
  }
  const user = await User.findById(req.user._id).select('+password');

  let correct = false;
  correct = await user.verifyPassword(currentPassword, user.password);

  if (!correct) {
    return next(new AppError(400, 'The current password is incorrect'));
  }

  /** Update the password */
  user.password = newPassword;
  user.confirmPassword = confirmNewPassword;
  await user.save();

  /** Sign the token */
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  /** Send the token */
  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
    token
  });
});

const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'You are not authorized to perform this action'));
    }
    next();
  }
}

module.exports = {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo
};
