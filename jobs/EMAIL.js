const nodemailer = require("nodemailer");
const logger = require("../utils/logger");
require('dotenv').config({path: __dirname + '/.env'});

// create reusable transporter object using the default SMTP transport
const email_password = process.env.EMAIL_PASSWORD;
//var transporter = nodemailer.createTransport(`smtps://velogistics-server%40outlook.de:${email_password}@smtp-mail.outlook.com:587`);
let transport = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", // hostname
  secureConnection: false, // TLS requires secureConnection to be false
  port: 587, // port for secure SMTP
  auth: {
    user: "velogistics-server@outlook.de",
    pass: email_password
  },
  tls: {
    ciphers: "SSLv3"
  }
});
let sender =
  process.env.EMAIL_NOTIFICATION_ADDRESS ||
  '"Velogistics Server ?" <velogistics-server@outlook.de>';
if (process.env.NODE_ENV === "production") {
  transport = nodemailer.createTransport({
    sendmail: true,
    path: "/usr/sbin/sendmail",
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    newline: "unix"
  });
}

const EMAIL = (exports.EMAIL = "EMAIL");
exports.default = function(agenda) {
  agenda.define(EMAIL, function(job, done) {
    const data = job.attrs.data;
    const mailOptions = {
      from: sender, // sender address
      to: data.to, // list of receivers
      subject: data.subject, // Subject line
      text: data.text,
      html: data.html
    };
    transport.sendMail(mailOptions, function(error) {
      if (error) {
        logger.error(error);
      }
      done(error);
    });
  });
};
