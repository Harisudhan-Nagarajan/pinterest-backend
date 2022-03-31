import express from "express";
import multer from "multer";
import auth from "./middleware/auth.js";
import {
  userdetial,
  updatefeed,
  updateprofileinfo,
  checkuser,
} from "./helper.js";
const router = express.Router();

router.get("/Home", async (request, response) => {
  if (!request.header("username")) {
    response.status(400).send({ message: "failure" });
  }
  const userdetials = await userdetial(request.header("username"));
  if (userdetials.length > 0) {
    response.status(200).send(userdetials[0]);
    return;
  }
  response.status(400).send({ message: "failure" });
});

router.post("/postfeed", async (request, response) => {
  const { feed } = request.body;
  const postfeeds = await updatefeed(request.header("username"), feed);
  if (postfeeds.acknowledged) {
    response.status(200).send({ message: "success" });
    return;
  }
  response.status(400).send({ message: "failure" });
});

router.post("/updateuserdetial", auth, async (request, response) => {
  const { name, about, website, newusername } = request.body;
  const username = request.header("username");
  if (!username) {
    response.status(400).send({ username: "failure" });
    return;
  }
  
  if (username !== newusername) {
    const checkusers = await checkuser(username);
    console.log(checkuser);
    if (checkusers) {
      response.status(400).send({ message: "username already exists" });
      return;
    }
  }

  const updateprofile = await updateprofileinfo(
    username,
    name,
    about,
    website,
    newusername
  );
  if (updateprofile.acknowledged) {
    response.status(200).send({ message: "success" });
    return;
  }
  response.status(400).send({ message: "failure" });
});
export const userdetials = router;
