const dotenv = require('dotenv');
dotenv.config({ path: ['./config.env', './config.private.env'] });
const app = require('./app');

const PORT = 8888;
const server = app.listen(PORT, () => {
  console.log(`Listening to requests on PORT ${PORT}`);
});

server.on('unhandledRejection', (err) => {
  // console.error(err);
  console.error('Unhandled Rejection 💣💥💥');
  console.log('Shutting down the app...');
  server.close(() => {
    process.exit(1);
  });
});

server.on('uncaughtException', (err) => {
  // console.error(err);
  console.error('Uncaught Exception 💣💥💥');
  console.log('Shutting down the app...');
  process.exit(1);
});

