const catchAsync = require("../utils/catchAsync");
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

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
  // find the user based on email
  const { email, username, password } = req.body;
  if ((!email && !username) || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please enter email/username and password'
    });
  }
  const user = await User.findOne({ $or: [{email}, {username}] }).select('+password');
  console.log(user);

  // If user is found, validate the password through instance schema method
  let passwordIsCorrect = false;
  passwordIsCorrect = await user.validatePassword(req.body.password, user.password);
  if (!user || !passwordIsCorrect ) {
    return res.status(400).json({
      status: '400',
      error: 'Invalid Credentials'
    });
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

module.exports = {
  signup,
  login
};
