const AppError = require("../utils/AppError");

const sendErrorForDevelopmentEnv = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  res.status(statusCode).json({
    status,
    message: err.message,
    err,
    stack: err.stack
  });
};

const sendErrorForProductionEnv = (err, res) => {
  if (err.isOperationalError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error. Something Went Wrong'
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    sendErrorForDevelopmentEnv(err, res);
  } else {
    let error = Object.create(err);

    /** Handle cast error */
    if (error.name === 'CastError') {
      const message = 'Invalid ID :: ' + error.value;
      error = new AppError(400, message);
    }

    /** Handle duplicate value error */
    if (error.code === 11000) {
      const duplicateKeyValue = Object.entries(error.keyValue)[0];
      const message = `Duplicate value for field ${duplicateKeyValue[0]} :: ${duplicateKeyValue[1]}. Already present in DB`;
      error = new AppError(400, message);
    }

    /** Handle Validation Error */
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(current => current.message).join('. ');
      error = new AppError(400, message);
    }

    sendErrorForProductionEnv(error, res);
  }
};

module.exports = {
  globalErrorHandler
};
