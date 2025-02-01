const catchAsync = require("../utils/catchAsync");
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailUser = require('../utils/mail');
const AppError = require("../utils/AppError");

const sendCredentialsAsCookies = (res, token, refresh_token) => {
  res.cookie('token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: process.env.JWT_EXPIRES_IN
  });
  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: process.env.REFRESH_TOKEN_EXPIRES_IN
  });
};

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

  // Generate the refresh token
  const refresh_token = jwt.sign({ id: newUser.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
  });

  // Hash the refresh token and save to db
  await newUser.saveRefreshToken(refresh_token);
  await newUser.save({ validateBeforeSave: false });

  sendCredentialsAsCookies(res, token, refresh_token);

  res.status(201).json({
    status: 'success',
    message: 'User created successfully'
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
  passwordIsCorrect = user && await user.validatePassword(req.body.password, user.password);
  
  if (!user || !passwordIsCorrect ) {
    const appError = new AppError(400, 'Invalid Credentails');
    return next(appError);
  }

  // If password is correct, then sign and send the token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  // Generate the refresh token
  const refresh_token = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
  });

  // Hash the refresh token and save to db
  await user.saveRefreshToken(refresh_token);
  await user.save({ validateBeforeSave: false });

  sendCredentialsAsCookies(res, token, refresh_token);
  
  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully'
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

  // Sign a new refresh token and send the token
  const refresh_token = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
  });

  sendCredentialsAsCookies(res, token, refresh_token);

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful'
  });
});

const updatePassword = catchAsync(async (req, res, next) => {

  // User is already authenticated and details are present on request object
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    const appError = new AppError(400, 'Please enter currentPassword, newPassword, and confirmNewPassword');
    return next(appError);
  };

  // Validate if the current password is correct
  let user = await User.findById(req.user.id).select('+password');
  let passwordIsCorrect = false;
  passwordIsCorrect = await user.validatePassword(currentPassword, user.password);
  if (!passwordIsCorrect) {
    const appError = new AppError(400, "Current Password is incorrect");
    return next(appError);
  }

  // Save the new password provided by the user
  user.password = newPassword;
  user.confirmPassword = confirmNewPassword;
  await user.save({ validateBeforeSave: true });

  // Sign a new token and send the token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  // Sign a new refresh token and send the token
  const refresh_token = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
  });

  sendCredentialsAsCookies(res, token, refresh_token);

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
});

/**
 * Proect - For Bearer Auth
 * Read the token from request headers
 * Less secure and manually manage the access tokens
 */
const protectOld = catchAsync(async (req, res, next) => {

  // Check if bearer token is passed with the request
  if (req.headers && !req.headers.authorization) {
    const appError = new AppError(401, 'You are not logged in. Please login');
    return next(appError);
  }

  // Extract the bearer token and verify the token
  let token = req.headers && req.headers.authorization && req.headers.authorization.split('Bearer ')[1];
  let decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if the user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    const appError = new AppError(401, 'User deleted');
    return next(appError);
  }

  // Check if the password was changed after after the token was issued
  const issuedJwtTimestamp = decoded.iat;
  let passwordWasChanged = user.didPasswordChange(issuedJwtTimestamp);
  if (passwordWasChanged) {
    const appError = new AppError(401, 'Password was changed recently. Please login again.')
    return next(appError);
  }

  // All good, invoke the next middleware in the middleware stack
  req.user = user;
  next();
});

const protect = catchAsync(async (req, res, next) => {
  // Get the token from the cookies
  let token = req.cookies?.token;
  if (!token) {
    const appError = new AppError(401, 'You are not logged in. Please login');
    return next(appError);
  }

  // Verify token
  console.log('The token is: ', token);
  let decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if the user still exits
  const user = await User.findById(decoded.id);
  if (!user) {
    const appError = new AppError(401, 'User deleted');
    return next(appError);
  }

  // Check if the password was changed after the token was issued
  const issuedJwtTimestamp = decoded.iat;
  let passwordWasChanged = user.didPasswordChange(issuedJwtTimestamp);
  if (passwordWasChanged) {
    const appError = new AppError(401, 'Password was changed recently. Please login again');
    return next(appError);
  }

  // All good, invoke the next middleware in the middelware stack to grant access
  req.user = user;
  next();
})

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const appError = new AppError(403, 'You are not authorized to perform this action');
      return next(appError);
    }
    next();
  }
}

const refreshAccessToken = catchAsync(async (req, res, next) => {
  const refresh_token = req.cookies?.refresh_token;
  if (!refresh_token) {
    const appError = new AppError(400, "Please provide refresh token");
    return next(appError);
  }

  // Get the user based on the refresh token
  const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user) {
    const appError = new AppError(400, "Invalid refresh token or user not found");
    return next(appError);
  }

  // Validate the refresh token
  const refreshTokenIsValid = await user.validateRefreshToken(refresh_token, user.refreshToken);
  if (!refreshTokenIsValid) {
    const appError = new AppError(400, "Invalid refresh token");
    return next(appError);
  }

  // Generate a new access token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.cookie('token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: process.env.JWT_EXPIRES_IN
  });

  res.status(200).json({
    status: 'success',
    message: 'token refreshed successfully'
  });
});

const logout = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
  res.clearCookie('token');
  res.clearCookie('refresh_token');
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  refreshAccessToken,
  logout
};
