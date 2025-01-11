import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter =  nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  export {transporter};