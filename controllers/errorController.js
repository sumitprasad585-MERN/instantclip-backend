const AppError = require('../utils/AppError');

const sendErrorForDevelopmentEnv = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  return res.status(statusCode).json({
    status,
    name: err.name,
    message: err.message,
    err,
    stack: err.stack
  });
}

const sendErrorForProduction = (err, res) => {
  if (err.isOperationalError) {
    const { statusCode, status, message } = err;
    res.status(statusCode).json({
      status,
      message
    })
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error. Something went wrong'
    });
  }
}

const globalErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    sendErrorForDevelopmentEnv(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    /** Handle Cast Error */
    if (error.name === "CastError") {
      error = new AppError(400, "Invalid ID. Please enter a valid ID");
    }

    /** Handle JWT Token Errors */
    if (error.name === "JsonWebTokenError") {
      error = new AppError(400, "Invalid Token. Please login again");
    }

    /** Handle Token Expired Error */
    if (error.name === "TokenExpiredError") {
      error = new AppError(400, "Token Expired. Please login again");
    }

    /** Handle Model validation errors */
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors).map(current => current.message).join('. ');
      error = new AppError(400, message);
    }

    /** Handle Duplicate value error */
    if (error.code === 11000) {
      const duplicateKeyValue = Object.entries(error.keyValue)[0];
      const message = `Duplicate value for ${duplicateKeyValue[0]}: ${duplicateKeyValue[1]}`;
      error = new AppError(400, message);
    }

    /** Handle Mongoose Error */
    if (error.name === "MongooseError") {
      error = new AppError(400, error.message);
    }

    sendErrorForProduction(error, res);
  }
}

module.exports = {
  globalErrorHandler,
}
