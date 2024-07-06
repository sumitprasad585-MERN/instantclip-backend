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
    sendErrorForProductionEnv(err, res);
  }
};

module.exports = {
  globalErrorHandler
};
