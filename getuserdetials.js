import express from "express";
import multer from "multer";
import auth from "./middleware/auth.js";
import { savepin, changeprofile } from "./helper.js";
const router = express.Router();

router.get("/Home", auth, async (request, response) => {
  if (!request.header("username")) {
    response.status(400).send({ message: "failure" });
  }
  const userdetials = await checkuser(request.header("username"));

  response.send(userdetials);
});

export const userdetials = router;
