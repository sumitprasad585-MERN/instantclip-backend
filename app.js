const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const clipRouter = require('./routes/clipRoutes');
const userRouter = require('./routes/userRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerSpec');
const AppError = require('./utils/AppError');
const { globalErrorHandler } = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development')
  app.use(morgan('dev'));

/** Add Helmet to set security related response headers automatically */
app.use(helmet());

// app.use(express.json());
app.use(bodyParser.json());

/** Swagger */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/** Mount the routers */
app.use('/api/v1/clips', clipRouter);
app.use('/api/v1/users', userRouter);

app.use('*', (req, res, next) => {
  const message = `The resource ${req.originalUrl} is not found on the server ${req.get('host')}`;
  const appError = new AppError(404, message);
  next(appError);
});

app.use(globalErrorHandler);

module.exports = app;
