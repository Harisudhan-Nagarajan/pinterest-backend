import express from "express";
import multer from "multer";
import auth from "./middleware/auth.js";
import { userdetial, updatefeed, updateprofileinfo } from "./helper.js";
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

router.post("/updateuserdetial", async (request, response) => {
  const { name, about, website, username } = request.body;
  const oldusername = request.header("username");
  const updateprofile = await updateprofileinfo(
    oldusername,
    name,
    about,
    website,
    username
  );
  if (updateprofile.acknowledged) {
    response.status(200).send({ message: "success" });
    return;
  }
  response.status(400).send({ message: "failure" });
});
export const userdetials = router;
