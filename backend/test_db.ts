import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/luyentay").then(async () => {
  const db = mongoose.connection.db;
  const notifications = await db.collection("notifications").find().toArray();
  console.log("Notifications:", notifications.length);
  console.log(notifications);
  process.exit(0);
});
