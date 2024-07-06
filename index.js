const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
dotenv.config({ path: './config.private.env' });
const app = require('./app');
const mongoose = require('mongoose');

let DATABASE = process.env.DATABASE_URL;
DATABASE = DATABASE.replace('<username>', process.env.DATABASE_USERNAME);
DATABASE = DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
DATABASE = DATABASE.replace('<dbname>', process.env.DBNAME);

mongoose.connect(DATABASE, {

})
  .then(con => {
    // console.log(con);
    console.log('Database connection successful...');
  })
  .catch(err => {
    console.log(err);
    console.log('An error occurred while connecting to database');
    console.log('Shutting down the app');
    process.exit(1);
  });

const PORT = 5858;
const server = app.listen(PORT, () => {
  console.log(`Listening to requests on PORT ${PORT}`);
});

server.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection💣💥');
  console.log(err);
  console.log('Shutting down the app...');
  server.close(() => {
    process.exit(1);
  });
});

server.on('uncaughtException', (err) => {
  console.log('Uncaught Exception💣💥');
  console.log(err);
  console.log('Shutting down the app');
  process.exit(1);
});
