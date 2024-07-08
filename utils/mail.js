const nodemailer = require('nodemailer');

const sendMail = async (mailOptions) => {

  const transporter = nodemailer.createTransport({
    /** gmail auth credentials in private config file */
    service: 'gmail',
    logger: true,
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  const options = {
    to: mailOptions.to,
    from: {
      name: 'Sumit Prasad from Instantclip',
      address: 'sumitprasad303@gmail.com'
    },
    subject: mailOptions.subject,
    text: mailOptions.text
  };

  await transporter.sendMail(options)
};

module.exports = sendMail;