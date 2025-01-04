import express from "express";
import cors from "cors";
// import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {otp} from "./otpGenerator.js";
import {transporter} from "./mail.js";
import { User } from "./models/UserInfo.js";
import { AddRecipe } from "./models/RecipeInfo.js";

dotenv.config();
const app = express();

// mongoose connection
mongoose.connect("mongodb://localhost:27017/RecipeSharing").then(() => {
  console.log("data base connected");
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend starting .... 😉");
});

// Sign Up
app.post("/SignUp", async (req, res) => {
  const { FirstName, LastName, Email, Password } = req.body;
//   console.log(req.body);
  let email = Email.toLowerCase();
  let UserID = "";
  for (let i = 0; i < email.length; i++) {
    let y = email.charAt(i);
    if (y != "@") {
      UserID += y;
    } else {
      break;
    }
  }

  // database store Signup
  const DublicateUser = await User.findOne({UserID:UserID});
  if (DublicateUser) {
    console.log(DublicateUser , " Dublicate user");
    res.status(500).json({ error: "user already aviable please Login" });


  } else {

    const user = await User.create({
        FirstName: FirstName,
        LastName: LastName,
        Email: email,
        Password: Password,
        UserID: UserID,
      });
      console.log("data store done :");
      
      let mailOptions = {
          from: process.env.GMAIL_USER,
          to:email,
          subject:"OTP",
          text:`One Time Password OTP : ${otp}`,
          html:` <h2> One Time Password OTP : ${otp} </h2>`,
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error try later" });
          } else {
            console.log("OTP send successfull");
            res.status(200).json({ message: "OTP sent successfully!" });
          }
        });
  }
});

//  Login

app.post("/Login", async (req, res) => {});

// Email Sending
app.post("/send-email", (req, res) => {
  const { to, subject, text, html } = req.body;
    console.log(req.body);

  let mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to send email" });
    } else {
      res.status(200).json({ message: "Email sent successfully!", info });
    }
  });
});

app.listen(process.env.PORT, () => {
  console.log(
    `Email server is running on http://localhost:${process.env.PORT}`
  );
});
