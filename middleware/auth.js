import Jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const auth = async (request, response, next) => {
  try {
    const token = request.header("x-auth-token");
    Jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    response.send({ error: err.message });
  }
};

export default auth;