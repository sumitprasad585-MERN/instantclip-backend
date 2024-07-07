const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require('../utils/ApiFeatures');
const User = require('../models/userModel');

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

module.exports = {
  getAllUsers,
  getUser
};
