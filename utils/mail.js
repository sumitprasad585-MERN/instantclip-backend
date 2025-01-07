const nodemailer = require('nodemailer');

const mailUser = async (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    logger: true,
  });

  const { to, subject, text, html } = mailOptions;
  await transporter.sendMail({
    to,
    from: {
      name: 'Sumit Prasad from InstantClip 📋',
      address: process.env.GMAIL_USERNAME
    },
    subject,
    text,
    html
  });
};

module.exports = mailUser;
