const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/AppError');
const { promisify } = require('util');

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
  if (user) {
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

module.exports = {
  signup,
  login,
  protect
};
