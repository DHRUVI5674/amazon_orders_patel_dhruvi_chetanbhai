import mongoose from "mongoose";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const maskMongoUrl = (url) => {
  try {
    const u = new URL(url);
    const host = u.host || u.hostname;
    const user = u.username ? `${u.username}:***@` : "";
    return `${u.protocol}//${user}${host}${u.pathname || ""}${u.search || ""}`;
  } catch {
    return "(invalid URL)";
  }
};

const connectDB = async ({ retries = 3, backoffMs = 1500 } = {}) => {
  let mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) throw new Error("MONGODB_URL is not set in environment");

  // Programmatically encode password if it contains '@' to prevent connection failures
  const atCount = (mongoUrl.match(/@/g) || []).length;
  if (atCount > 1) {
    const protocolMatch = mongoUrl.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
    if (protocolMatch) {
      const protocol = protocolMatch[1];
      const rest = protocolMatch[2];
      const lastAtIndex = rest.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        const credentials = rest.substring(0, lastAtIndex);
        const hostAndRest = rest.substring(lastAtIndex + 1);
        const colonIndex = credentials.indexOf(':');
        if (colonIndex !== -1) {
          const username = credentials.substring(0, colonIndex);
          const password = credentials.substring(colonIndex + 1);
          // Only encode if it isn't already encoded (doesn't contain '%')
          const encodedPassword = password.includes('%') ? password : encodeURIComponent(password);
          mongoUrl = `${protocol}${username}:${encodedPassword}@${hostAndRest}`;
        }
      }
    }
  }

  const shortUrl = maskMongoUrl(mongoUrl);
  console.log(`Connecting to MongoDB: ${shortUrl}`);

  let attempt = 0;
  while (attempt < retries) {
    try {
      attempt += 1;
      console.log(`MongoDB connect attempt ${attempt}/${retries}...`);

      await mongoose.connect(mongoUrl, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });

      console.log("✓ MongoDB Connected successfully");
      console.log(`✓ Connected to database: ${mongoose.connection.name}`);
      return true;
    } catch (error) {
      console.error(`✗ Attempt ${attempt} failed:`, error.message || error);
      if (attempt >= retries) {
        console.error("✗ MongoDB Connection Failed after retries.");
        console.error("✗ Make sure:");
        console.error("  1. MongoDB credentials in .env are correct");
        console.error("  2. Your IP is whitelisted in MongoDB Atlas");
        console.error("  3. Network connection is working");
        console.error(error.stack || error);
        throw error;
      }

      const wait = backoffMs * attempt;
      console.log(`Waiting ${wait}ms before retrying...`);
      await sleep(wait);
    }
  }
};

export default connectDB;