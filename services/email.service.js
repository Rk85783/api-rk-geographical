import nodemailer from "nodemailer";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendMail = async ({ recieverEmail, subject, emailTemplatePath, templateData = {} }) => {
  try {
    // Read the template file
    const template = fs.readFileSync(path.resolve(__dirname, emailTemplatePath), 'utf-8');

    // Render the template with data
    const html = ejs.render(template, templateData);

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.SMTP_SENDER_EMAIL,
      to: recieverEmail,
      cc: process.env.SMTP_CC_EMAIL,
      subject,
      html, // Use the rendered HTML
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}