const catchAsync = require("../utils/catchAsync");
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailUser = require('../utils/mail');
const AppError = require("../utils/AppError");

const signup = catchAsync(async (req, res, next) => {
  // Get only required fields from user, so that user doesn't inject malicious fields like role: admin
  const { username, email, password, confirmPassword } = req.body;

  // Save the user (Password would be encrypted through pre save hook)
  const newUser = await User.create({
    username,
    email,
    password,
    confirmPassword
  });

  // Sign the token and send the token
  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

const login = catchAsync(async (req, res, next) => {
  // find the user based on email or username
  const { email, username, password } = req.body;
  if ((!email && !username) || !password) {
    const appError = new AppError(400, 'Please enter email/username and password');
    return next(appError);
  }

  const user = await User.findOne({ $or: [{email}, {username}] }).select('+password');

  // If user is found, validate the password through instance schema method
  let passwordIsCorrect = false;
  passwordIsCorrect = await user.validatePassword(req.body.password, user.password);
  if (!user || !passwordIsCorrect ) {
    const appError = new AppError(400, 'Invalid Credentails');
    return next(appError);
  }

  // If password is correct, then sign and send the token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(200).json({
    status: 'success',
    token
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  // Check if email or username is provided
  const { email, username } = req.body;
  if (!email && !username) {
    const appError = new AppError(400, 'Please enter email or username');
    return next(appError);
  }

  // Find the user based on email or username
  const user = await User.findOne({$or: [{email}, {username}]})
  if (!user) {
    const appError = new AppError(404, 'No user found with that email/username');
    return next(appError);
  }

  // Create password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send the resetToken to user over mail
  const subject = 'Password Reset | Valid for 1 Hour ⏰';
  const text = `To reset your password, send a PATCH request to http://localhost:8888/api/v1/users/resetPassword/${resetToken} Valid for 1 Hours ⏰. Ignore if already done`;
  await mailUser({
    to: user.email,
    subject,
    text,
  })

  res.status(200).json({
    status: 'success',
    message: 'Password reset link sent to the registered mail'
  });
});

const resetPassword = catchAsync(async (req, res, next) => {

  // Hash the token and find the user based on hashed token
  const { resetToken } = req.params;
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresAt: { $gt: Date.now() }
  });

  if (!user) {
    const appError = new AppError(400, 'Invalid or Expired Token');
    return next(appError);
  }

  if (!req.body.password && !req.body.confirmPassword) {
    const appError = new AppError(400, 'Please enter password and confirmPassword');
    return next(appError);
  }

  // Save the new password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save({ validateBeforeSave: true });

  // Sign a new token and send the token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful',
    token
  });
});

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword
};
