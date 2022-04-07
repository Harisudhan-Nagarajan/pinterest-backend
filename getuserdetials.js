import express from "express";
import multer from "multer";
import auth from "./middleware/auth.js";
import {
  userdetial,
  updatefeed,
  updateprofileinfo,
  checkuser,
  searchpin,
  searchprofile,
  userpins,
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

  if (username !== newusername) {
    const checkusers = await checkuser(newusername);
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

router.post("/searchpin", auth, async (request, response) => {
  if (!request.header("username")) {
    response.status(400).send({ message: "failure" });
  }
  const { searchvalue } = request.body;
  const searchpins = await searchpin(searchvalue);
  if (searchpins.length > 0) {
    response.status(200).send(searchpins);
    return;
  }
  response.status(400).send({ message: "failure" });
});

router.post("/searchprofile", async (request, response) => {
  if (!request.header("username")) {
    response.status(400).send({ message: "failure" });
  }
  const { searchvalue } = request.body;
  const searchprofiles = await searchprofile(searchvalue);
  if (searchprofiles.length > 0) {
    response.status(200).send(searchprofiles);
    return;
  }
  response.status(400).send({ message: "failure" });
});

router.post("/profileview", async (request, response) => {
  const { name } = request.query;
  const username = name;
  const userdetials = await userdetial(username);

  if (userdetials.length === 0) {
    response.status(400).send({ message: "failure" });
    return;
  }
  const pins = await userpins(name);
  const userinfo = { userdetial: userdetials[0], pins: pins };
  response.status(200).send(userinfo);
});

export const userdetials = router;
