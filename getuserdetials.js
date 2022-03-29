import express from "express";
import multer from "multer";
import auth from "./middleware/auth.js";
import { userdetial } from "./helper.js";
const router = express.Router();

router.get("/Home", auth, async (request, response) => {
  if (!request.header("username")) {
    response.status(400).send({ message: "failure" });
  }
  const userdetials = await userdetial(request.header("username"));

  response.send({ mwessage: "success" });
});

export const userdetials = router;
