import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? "variables.prod.env" : "variables.dev.env"
});

export default {
  DATABASE: process.env.DATABASE,
  PORT: process.env.PORT,
  ALLOWED_HOST: process.env.ALLOWED_HOST
};
