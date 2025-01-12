import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { otp } from "./otpGenerator.js";
import { transporter } from "./mail.js";
import { User } from "./models/UserInfo.js";
import { AddRecipe } from "./models/RecipeInfo.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

// mongoose connection
mongoose.connect("mongodb://localhost:27017/RecipeSharing").then(() => {
  console.log("data base connected");
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Backend starting .... 😉");
});

// Fetch data recipe

app.get("/Recipe", async (req, res) => {
  const { Category, limit } = req.query;
  try {
    const query = { Category: new RegExp(Category, "i") };
    const recipes = limit
      ? await AddRecipe.find(query).limit(parseInt(limit))
      : await AddRecipe.find(query);

    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// getch by id
app.get("/show", async (req, res) => {
  const { id } = req.query;
  const showRecipe = await AddRecipe.find({ _id: id });
  if (showRecipe) {
    res.json(showRecipe);
  } else {
    res.status(500).json({ message: "server error" });
  }
});

// Sign Up
app.post("/SignUp", async (req, res) => {
  const { FirstName, LastName, Email, Password } = req.body;
  //   console.log(req.body);
  let UserID = Email.toLowerCase().split("@")[0];

  // database store Signup
  const DublicateUser = await User.findOne({ UserID: UserID });
  if (DublicateUser) {
    console.log(DublicateUser, " Dublicate user");
    res.status(500).json({ message: "user already aviable please Login" });
  } else {
    let mailOptions = {
      from: process.env.GMAIL_USER,
      to: Email,
      subject: "OTP",
      text: `One Time Password OTP : ${otp}`,
      html: ` <h2> One Time Password OTP : ${otp} </h2>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error try later" });
      } else {
        console.log("OTP send successfull", otp);
        res.status(200).json({ message: otp });
        CreateUser();
      }
    });

    async function CreateUser() {
      const user = await User.create({
        FirstName: FirstName,
        LastName: LastName,
        Email: Email.toLowerCase(),
        Password: Password,
        UserID: UserID,
      });
      console.log("data store done :");
    }
  }
});

//  Login

app.post("/Login", async (req, res) => {
  const { Email, Password } = req.body;
  console.log(req.body);
  if (!Email || !Password) {
    return res.status(400).json({ message: "Email and Password Required" });
  }
  const LoginUser = await User.findOne({ Email: Email.toLowerCase() });

  if (LoginUser) {
    const isPasswordValid = await LoginUser.isPasswordCorrect(Password);

    if (isPasswordValid) {
      const accessToken = await LoginUser.generateAccessToken();
      console.log("Access token : ", accessToken);
      const options = {
        httpOnly: true,
        secure: false,
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json({ message: "Login successfully" });
    } else {
      res.status(401).json({ message: "Incorrect Password " });
    }
  } else {
    res.status(401).json({ message: "Email Not Valid" });
  }
});

// LogOut
app.post("/logout", (req, res) => {
  res.clearCookie("accessToken").json({ message: "Logged out successfully" });
});

// Forgot Password

app.post("/ForgotPassword", async (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(400).json({ message: "Please enter an email address." });
  }

  const ForgotPasswordInfo = await User.findOne({ Email: Email.toLowerCase() });
  if (!ForgotPasswordInfo) {
    return res.status(404).json({ message: "User does not exist." });
  }

  let mailOptions = {
    from: process.env.GMAIL_USER,
    to: Email,
    subject: "Forgot Password",
    text: `Your new password: ${otp}`,
    html: `<h2>Your new password: ${otp}</h2>`,
  };

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to send email. Try again later." });
    }
    console.log("new password: ", otp);
    ForgotPasswordInfo.Password = otp;
    try {
      await ForgotPasswordInfo.save();
      res.status(200).json({ message: "New password sent to your email." });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to update password. Try again later." });
    }
  });
});

// profile

app.get("/profile", async (req, res) => {
  console.log("request cookies :", req.cookies);

  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decode access token :", decoded);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      UserID: user.UserID,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Email: user.Email,
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    console.log(error);
  }
});

// post fetch
app.get("/post", async (req, res) => {
  const { UserID } = req.query;
  const showRecipe = await AddRecipe.find({ UserID:UserID });
  if (showRecipe) {
    res.json(showRecipe);
  } else {
    res.status(500).json({ message: "server error" });
  }
});

//  Add Recipe
app.post("/Add", async (req, res) => {
  const { RecipeName, Category, Imageurl, Ingredients, Instructions, UserID } =
    req.body;
  // let UserID = "rishabhkushwaha9559";
  console.log(req.body);

  const RecipeAdd = await AddRecipe.create({
    UserID: UserID,
    RecipeName: RecipeName,
    Category: Category,
    Imageurl: Imageurl,
    Ingredients: Ingredients,
    Instructions: Instructions,
  });
  if (RecipeAdd) {
    res.status(200).json({ message: "Recipe add successful" });
  } else {
    res
      .status(500)
      .json({ message: "some thing went wrong, please try later" });
  }
});

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
