const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const clipRouter = require('./routes/clipRoutes');
const userRouter = require('./routes/userRoutes');
const { globalErrorHandler } = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development')
  app.use(morgan('dev'));

// Add security related headers
app.use(helmet());

// Parse the request body
// app.use(bodyParser.json());
app.use(express.json());

// Mount the routers
app.use('/api/v1/clips', clipRouter);
app.use('/api/v1/users', userRouter);

// Global Error Hanlder
app.use(globalErrorHandler);
module.exports = app;