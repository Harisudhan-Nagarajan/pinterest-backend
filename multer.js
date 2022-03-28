import express from "express";
import multer from "multer";
import auth from "./middleware/auth.js";
import { savepin, changeprofile } from "./helper.js";
const router = express.Router();

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images"); //important this is a direct path fron our current file to storage location
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

router.post(
  "/single",
  auth,
  upload.single("image"),
  async (request, response) => {
    console.log(request.file.path);
    const { path } = request.file;
    console.log(request.body);
    const { title, aboutpin, link } = request.body;
    const username = request.header("username");
    const save = await savepin(title, username, path, aboutpin, link);
    response.send(save);
  }
);

router.post(
  "/profilechange",
  auth,
  upload.single("image"),
  async (request, response) => {
    console.log(request.file.path);
    const { path } = request.file;

    const username = request.header("username");
    const change = await changeprofile(username, path);
    if (change.acknowledged) {
      response.send({ path: path });
      return;
    }

    response.send(change);
  }
);

export const createpinRouter = router;

// fs.rmdir("./images"); -delete file and folder
