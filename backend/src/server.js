import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ✅ MUST be first (before ANY import using env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

import app from "./app.js";
import connectDB from "./config/db.js";

const rawPort = process.env.PORT?.toString().trim() || "";
const parsedPort = rawPort ? Number.parseInt(rawPort.replace(/[^0-9].*$/, ""), 10) : 5000;
const PORT = Number.isInteger(parsedPort) && parsedPort >= 0 && parsedPort < 65536 ? parsedPort : 5000;

if (rawPort && String(parsedPort) !== rawPort) {
  console.warn(`Invalid PORT env value "${rawPort}". Falling back to ${PORT}.`);
}

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n✓ Server is running on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}`);
      console.log(`✓ Try: http://localhost:${PORT}/api/v1/orders\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();