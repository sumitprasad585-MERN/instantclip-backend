const dotenv = require('dotenv');
dotenv.config({ path: ['./config.env', './config.private.env'] });
const mongoose = require('mongoose');
const app = require('./app');

let DATABASE = process.env.DATABASE_URL;
DATABASE = DATABASE.replace('<db_username>', process.env.DATABASE_USERNAME);
DATABASE = DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);
DATABASE = DATABASE.replace('<db_name>', process.env.DBNAME);

mongoose
  .connect(DATABASE)
  .then((con) => {
    // console.log(con);
    console.log('Database connection successful✅');
  })
  .catch((err) => {
    console.error(err);
    console.log('Shutting down the app...');
    process.exit(1);
  });

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
