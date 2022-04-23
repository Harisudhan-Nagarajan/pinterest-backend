import express from "express";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  harshpassword,
  checkuser,
  senduserdetials,
  updateresetcode,
  deleteresetcode,
  updatepassword,
} from "./helper.js";
import auth from "./middleware/auth.js";
import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;

dotenv.config();
const router = express.Router();

//Signup Route
router.post("/signup", async (request, response) => {
  const { username, email, password } = request.body;
  //checking userName is available
  const checkusername = await checkuser(username);
  console.log(checkusername);
  //if username already exists
  if (checkusername) {
    response.status(400).send({ message: "username already exists" }); //if username already exists
    return;
  }
  //getting harshpassword
  const hashedpassword = await harshpassword(password);
  //sending datas to DB

  const path = "images/1647928346695--default%20pic.jpg";
  const sends = await senduserdetials(username, email, hashedpassword, path);
  if (sends.acknowledged) {
    const checkusername = await checkuser(username);
    const token = Jwt.sign({ id: checkusername._id }, process.env.JWT_SECRET);
    response.status(200).send({ message: "success", token: token });
    return;
  }

  response.status(400).send({ message: "Error Occurs Please Try again later" });
});

//login Route
router.post("/signin", async (request, response) => {
  const { username, password } = request.body;
  const checkusername = await checkuser(username);
  if (!checkusername) {
    response.status(400).send({ message: "Ivalid Credentials" });
    return;
  }
  const checkpassword = await bcrypt.compare(password, checkusername.password);
  console.log(checkpassword);
  if (!checkpassword) {
    response.status(400).send({ message: "Ivalid Credentials" });
    return;
  }

  const token = Jwt.sign({ id: checkusername._id }, process.env.JWT_SECRET);

  response.status(200).send({ message: "login success", token: token });
});

// forgetpassword Route

async function sendMail(email, resetcode, response) {
  let mailTransporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      type: "OAuth2",
      user: process.env.mailid,
      pass: process.env.mailpass,
      clientId: process.env.client_id,
      clientSecret: process.env.client_secret,
      refreshToken: process.env.referencetoken,
      // accessToken: accessToken,
    },
  });

  let mailDetails = {
    from: "<noReply>",
    to: email,
    subject: "OTP",
    text: `The verificaion code is ${resetcode}`,
  };

  mailTransporter.sendMail(mailDetails, async (err) => {
    if (err) {
      return response.status(400).send({ message: "failure" });
    }
    return response.status(200).send({ message: "success" });
  });
}

router.post("/forgetpass", async (request, response) => {
  const { resetusername } = request.body;

  const checkusername = await checkuser(resetusername);

  if (!checkusername) {
    response.status(400).send({ message: "Ivalid Credentials" });
    return;
  }
  const { username, email } = checkusername;
  let resetcode = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, 6);
  const hashedpassword = await harshpassword(resetcode);
  const update_code = await updateresetcode(hashedpassword, username);
  if (update_code.acknowledged) {
    await sendMail(email, resetcode, response);
    return;
  }
  response.status(400).send({ message: "failure" });
});
// checkresetcode Route
router.post("/checkresetcode", async (request, response) => {
  const { resetusername, resetcode } = request.body;
  const checkusername = await checkuser(resetusername);
  const checkpassword = await bcrypt.compare(
    resetcode,
    checkusername.resetcode
  );
  if (!checkpassword) {
    response.status(400).send({ message: "Ivalid CODE" });
    return;
  }

  const token = Jwt.sign({ id: checkusername._id }, process.env.JWT_SECRET);

  const deleteresetcodef = await deleteresetcode(resetusername);
  if (deleteresetcodef.acknowledged) {
    response.status(200).send({ message: "code i correct", token: token });
    return;
  }
  response.status(400).send({ message: "Error Occurs Please Try again later" });
});

//changepassword Route
router.post("/changepassword", auth, async (request, response) => {
  const { password, username } = request.body;
  const hashedpassword = await harshpassword(password);

  const update_password = await updatepassword(username, hashedpassword);
  if (update_password.acknowledged) {
    response.status(200).send({ message: "password changed" });
    return;
  }
  response.status(400).send({ message: "Error Occurs Please Try again later" });
});

export const UseRouter = router;
