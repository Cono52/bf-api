import mongoose from "mongoose";
import app from "./app";
import env from "../envConfig";

mongoose.Promise = global.Promise;
mongoose.connect(
  env.DATABASE,
  { useNewUrlParser: true }
);
const db = mongoose.connection;
db.on("error", err => {
  console.log(err);
});

app.set("port", env.PORT || 7777);
const server = app.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
