import express from "express";
import cors from "cors";
// import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {otp} from "./otpGenerator.js";
import {transporter} from "./mail.js";
import { User } from "./models/UserInfo.js";
import { AddRecipe} from "./models/RecipeInfo.js";

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

// Fetch data Lunch
app.get("/Lunch", async (req,res)=>{
  const Lunch= await AddRecipe.find({Category:'Lunch'});
  if(Lunch){
  res.status(200).json({Lunch:Lunch});
  }
  else{
    res.status(500).json({message:'server error'});
  }
  console.log("lunch ");
  console.log(Lunch);

});

//  fetch data Breakfast

app.get("/Breakfast", async (req,res)=>{
  const Breakfast=await AddRecipe.find({Category:'Breakfast'});
  if(Breakfast){
    res.status(200).json({Breakfast:Breakfast});
  }
  else{
    res.status(500).json({message:'server error'});
  }
  console.log(Breakfast);
})

// fetch data Snack
app.get("/Snack", async(req,res)=>{
  const Snack=await AddRecipe.find({Category:'Snack'});
  if(Snack){
    res.status(200).json({Snack:Snack});
  }
  else{
    res.status(500).json({message:'server error'});
  }
  console.log(Snack);

})

// fetch data Dinner
app.get("/")



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
    res.status(500).json({ message: "user already aviable please Login" });


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
            return res.status(500).json({ message: "Server error try later" });
          } else {
            console.log("OTP send successfull",otp);
            res.status(200).json({ message: otp });
          }
        });

        
  }
});

//  Login

app.post("/Login", async (req, res) => {

  const {Email,Password}=req.body;
  console.log(req.body);
  let email = Email.toLowerCase();
  const LoginUser= await User.findOne({Email:email, Password:Password})
  if(LoginUser){
    res.status(200).json({message:" User found"})
  }

  else{
    res.status(500).json({message:"Email or Password wrong or User does not exist"})
  }
});

// Forgot Password
app.post("/ForgotPassword", async(req,res)=>{
    const{Email}=req.body;
    console.log(req.body);
    let email=Email.toLowerCase();
    const ForgotPasswordInfo=await User.findOne({Email:email});
    console.log(ForgotPasswordInfo);
    if(ForgotPasswordInfo){
      let mailOptions = {
        from: process.env.GMAIL_USER,
        to:email,
        subject:"Forgot Password",
        text:`Your Password be : ${ForgotPasswordInfo.Password}`,
        html:` <h2> Your Password be : ${ForgotPasswordInfo.Password} </h2>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "Server error try later" });
        } else {
          console.log("password send to mail");
          res.status(200).json({message:"Password send to your Email"})
        }
      });


    }
    else{
      res.status(500).json({message:"User does not exist"})
    }
})

//  Add Recipe
app.post("/Add", async(req,res)=>{
  const{RecipeName,Category,Imageurl,Ingredients,Instructions}=req.body;
  let UserID="rishabhkushwaha9559";
  console.log(req.body);
 
  const RecipeAdd=await AddRecipe.create({
    UserID:UserID,
    RecipeName:RecipeName,
    Category:Category,
    Imageurl:Imageurl,
    Ingredients:Ingredients,
    Instructions:Instructions,

  });
  if(RecipeAdd){
    res.status(200).json({message:"Recipe add successful"});
  }
  else{
    res.status(500).json({message:"some thing went wrong, please try later"});
  }
  
})


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
