import { client } from "./index.js";
import bcrypt from "bcrypt";

//harshpassword
export const harshpassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(password, salt);
  return hashedpassword;
};

//check user exist or not
export const checkuser = async (username) => {
  return await client
    .db("pinterest")
    .collection("userdetials")
    .findOne({ username: username });
};

export const userdetial = async (username) => {
  return await client
    .db("pinterest")
    .collection("userdetials")
    .find({ username: username })
    .project({ password: 0, resetcode: 0 })
    .toArray();
};
//create user
export const senduserdetials = async (
  username,
  email,
  hashedpassword,
  path
) => {
  return await client.db("pinterest").collection("userdetials").insertOne({
    name: username,
    username: username,
    email: email,
    password: hashedpassword,
    profilepic: path,
    setup: true,
    about: " ",
    website: " ",
  });
};

//save reset code as hash in database
export const updateresetcode = async (hashedpassword, username) => {
  return await client
    .db("pinterest")
    .collection("userdetials")
    .updateOne({ username: username }, { $set: { resetcode: hashedpassword } });
};

//delete reset code from database
export const deleteresetcode = async (username) => {
  return await client
    .db("pinterest")
    .collection("userdetials")
    .updateOne({ username: username }, { $set: { resetcode: "" } });
};

// password change
export const updatepassword = async (username, hashedpassword) => {
  return await client
    .db("pinterest")
    .collection("userdetials")
    .updateOne({ username: username }, { $set: { password: hashedpassword } });
};

//multer pin create
export const savepin = async (
  title,
  username,
  path,
  aboutpin,
  link,
  category
) => {
  return await client.db("pinterest").collection("pins").insertOne({
    title: title,
    username: username,
    path: path,
    aboutpin: aboutpin,
    link: link,
    category: category,
  });
};

//multer profile pic create
export const changeprofile = async (username, path) => {
  return await client
    .db("pinterest")
    .collection("userdetials")
    .updateOne({ username: username }, { $set: { profilepic: path } });
};

//updatefeed elements
export const updatefeed = async (username, feed) => {
  return await client
    .db("pinterest")
    .collection("userdetials")
    .updateOne({ username: username }, { $set: { feed: feed, setup: false } });
};

//update public profile
export const updateprofileinfo = async (
  oldusername,
  name,
  about,
  website,
  username
) => {
  return await client
    .db("pinterest")
    .collection("userdetials")
    .updateOne(
      { username: oldusername },
      {
        $set: {
          name: name,
          about: about,
          website: website,
          username: username,
        },
      }
    );
};

//search user


//search pins
export const searchpin = async (searchitem) => {
  return await client.db("pinterest").collection("pins").find({category:searchitem}).toArray();
}