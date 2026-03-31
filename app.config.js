const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });
dotenv.config();

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    "expo-video",
    "expo-secure-store"
  ],
  extra: {
    ...(config.extra || {}),
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
});