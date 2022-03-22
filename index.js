import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import { UseRouter } from "./routes.js";
import { createpinRouter } from "./multer.js";
dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

export const client = await createconnection();

async function createconnection() {
  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("connected");
    return client;
  } catch (err) {
    console.log(err);
  }
}

const app = express();

app.use(express.json()); // inbuild middleware
app.use(cors()); // to allow cross origin resource sharing

app.get("/", async (request, response) => {
  response.send("HELLO");
});

app.use("/users", UseRouter);
app.use("/usersdetials", createpinRouter);
app.use("/images", express.static("images"));
// app.use("/profile", Useroute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("App is runing on " + PORT);
});
