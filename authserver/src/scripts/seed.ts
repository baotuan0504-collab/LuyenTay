import mongoose from "mongoose";
import { User } from "../entities/User";
import { SecurityService } from "../modules/auth/security.service";

const SEED_USERS = [
  {
    name: "Emma Watson",
    email: "emma@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    name: "James Wilson",
    email: "james@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    name: "Sophia Chen",
    email: "sophia@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "Michael Brown",
    email: "michael@example.com",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
  {
    name: "Olivia Martinez",
    email: "olivia@example.com",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    name: "William Taylor",
    email: "william@example.com",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    name: "Ava Johnson",
    email: "ava@example.com",
    avatar: "https://i.pravatar.cc/150?img=16",
  },
  {
    name: "Benjamin Lee",
    email: "benjamin@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Isabella Garcia",
    email: "isabella@example.com",
    avatar: "https://i.pravatar.cc/150?img=20",
  },
  {
    name: "Ethan Davis",
    email: "ethan@example.com",
    avatar: "https://i.pravatar.cc/150?img=14",
  },
];

async function seed() {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chat-app";
    await mongoose.connect(mongoURI);
    const securityService = new SecurityService();
    const usersToInsert = await Promise.all(
      SEED_USERS.map(async (user) => ({
        ...user,
        password: await securityService.hashPassword("password123"),
      }))
    );

    const users = await User.insertMany(usersToInsert);
    console.log(`🌱 Seeded ${users.length} users:`);
    users.forEach((user) => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    await mongoose.disconnect();
    console.log("✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();
