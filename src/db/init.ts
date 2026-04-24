import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "./prisma.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function ensureDatabaseReady() {
  try {
    // 1. Quick check: Can we query the interaction table?
    await prisma.toolInteraction.findFirst();
  } catch (err) {
    const {
      DATABASE_HOST,
      DATABASE_USER,
      DATABASE_PASSWORD,
      DATABASE_NAME,
      DATABASE_URL
    } = process.env;

    let url = DATABASE_URL;

    if (!url && DATABASE_HOST && DATABASE_USER && DATABASE_NAME) {
      url = `mysql://${DATABASE_USER}:${DATABASE_PASSWORD || ''}@${DATABASE_HOST}:3306/${DATABASE_NAME}`;
    }

    if (!url) {
      console.error("OmniBridge: Missing database configuration. Logging will be disabled.");
      return;
    }

    const rootDir = path.resolve(__dirname, "../../");

    console.error("OmniBridge: Initializing database tables...");
    try {
      // Silence stdout (index 1) to prevent JSON protocol crashes in MCP clients
      execSync(`npx prisma migrate deploy`, {
        cwd: rootDir,
        stdio: ["ignore", "ignore", "inherit"],
        env: {
          ...process.env,
          DATABASE_URL: url,
        }
      });
      console.error("OmniBridge: Database successfully initialized.");
    } catch (error: any) {
      console.error("OmniBridge: Database initialization failed.");
      console.error(error.message);
    }
  }
}
