import mongoose from "mongoose";
import dotenv from "dotenv";
import { Notification } from "./src/modules/notification/model/notification.model.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/luyentay").then(async () => {
  const user = "69c830f7f656c68da48a41ff"; // The recipient ID from the previous query
  const objectIdUser = new mongoose.Types.ObjectId(user);
  const notifications1 = await Notification.find({ recipient: user });
  const notifications2 = await Notification.find({ recipient: objectIdUser });
  
  console.log("With string:", notifications1.length);
  console.log("With ObjectId:", notifications2.length);
  process.exit(0);
});
