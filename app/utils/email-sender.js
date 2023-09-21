const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path"); // Import the 'path' module
const dotenv = require("dotenv");
dotenv.config();
const dirname = require("path").dirname;
const fileURLToPath = require("url").fileURLToPath;



async function sendEmail(email, password) {
    try {
      // Create a transporter using your email service provider's SMTP settings
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASS,
        },
      });
  
      // Use __dirname to construct the absolute path to the email template file
      const templatePath = path.join(__dirname, '../email-templates/new-account.ejs');
  
      // Read the EJS template file
      const template = fs.readFileSync(templatePath, 'utf-8');
  
      // Compile the template with variables
      const compiledTemplate = ejs.compile(template);
      const html = compiledTemplate({ email, password });
  
      // Define email data
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Felicity OTS Account',
        html: html,
      };
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.response);
      return true;
    } catch (error) {
      console.error('Error sending email', error);
      return error.message;
    }
  }
async function sendPasswordResetEmail(email, password) {
    try {
      // Create a transporter using your email service provider's SMTP settings
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASS,
        },
      });
  
      // Use __dirname to construct the absolute path to the email template file
      const templatePath = path.join(__dirname, '../email-templates/reset-account.ejs');
  
      // Read the EJS template file
      const template = fs.readFileSync(templatePath, 'utf-8');
  
      // Compile the template with variables
      const compiledTemplate = ejs.compile(template);
      const html = compiledTemplate({ email, password });
  
      // Define email data
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Felicity OTS Password Reset',
        html: html,
      };
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.response);
      return true;
    } catch (error) {
      console.error('Error sending email', error);
      return error.message;
    }
  }


  // Export both functions.
module.exports = {
  sendEmail,
  sendPasswordResetEmail
};