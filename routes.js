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

dotenv.config();
const router = express.Router();

//Signup Route
router.post("/signup", async (request, response) => {
  const { username, email, password } = request.body;
  //checking userName is available
  const checkusername = await checkuser(username);
  //if username already exists
  if (checkusername) {
    response.status(400).send({ message: "username already exists" }); //if username already exists
    return;
  }
  //getting harshpassword
  const hashedpassword = await harshpassword(password);
  //sending datas to DB
  const sends = await senduserdetials(username, email, hashedpassword);
  if (sends.acknowledged) {
    response.status(200).send({ message: "success" });
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

  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.mailid,
      pass: process.env.mailpass,
    },
  });

  let mailDetails = {
    from: process.env.mailid,
    to: email,
    subject: "Password Reset",
    text: "Your Code is " + resetcode,
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("Error Occurs");
      response
        .status(400)
        .send({ message: "Error Occurs Please Try again later" });
      return;
    } else {
      console.log("Email sent successfully");
    }
  });
  const hashedpassword = await harshpassword(resetcode);
  const update_code = await updateresetcode(hashedpassword, username);
  if (update_code.acknowledged) {
    response.status(200).send({ message: "success" });
    return;
  }
  response.status(400).send({ message: "Error Occurs Please Try again later" });
});

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
    response.status(200).send({ message: "code is correct", token: token });
    return;
  }
  response.status(400).send({ message: "Error Occurs Please Try again later" });
});

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

router.get("/Home", auth, async (request, response) => {
  const userdetials = await checkuser(request.header("username"));

  response.send(userdetials);
});
export const UseRouter = router;
