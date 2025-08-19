import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { timing } from "hono/timing";
import { Env, Variables } from "./types";
import { createDb } from "./db/client";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import voteRoutes from "./routes/votes";
import commentRoutes from "./routes/comments";
import healthRoutes from "./health";
import { users } from "./db/schema";

// Import D1Database type from Cloudflare Workers types
type D1Database = import("@cloudflare/workers-types").D1Database;

// Create the main Hono application
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware setup
// Add timing information to responses
app.use("*", timing());

// Add request logging
app.use("*", logger());

// Configure CORS for cross-origin requests
app.use(
  "*",
  cors({
    origin: "*", // Change this to your frontend URL in production
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests", "Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
  })
);

// Database setup middleware
// Creates a database client for each request
app.use("*", async (c, next) => {
  // In test environment, c.env might not be set
  if (!c.env || !c.env.DB) {
    // Create a mock DB for testing
    c.env = {
      ...c.env,
      DB: {} as D1Database, // Mock DB object
      JWT_SECRET: "test-secret-key", // Mock JWT secret for testing
    };
  }

  const db = createDb(c.env.DB);
  c.set("db", db);
  await next();
});

// Route registration
// Mount all the different route modules
app.route("/auth", authRoutes);
app.route("/posts", postRoutes);
app.route("/votes", voteRoutes);
app.route("/comments", commentRoutes);
app.route("/health", healthRoutes);

// Health check endpoint
app.get("/", async (c) => {
  try {
    const db = c.get("db");
    // Test database connection
    const result = await db.select().from(users).limit(1);
    return c.json({
      message: "Hacker News Clone API is running!",
      jwtSecretKey: c.env.JWT_SECRET ? "Set" : "Not set",
      jwtSecret: c.env.JWT_SECRET ? "Set" : "Not set",
      database: "Connected",
      users: result.length,
    });
  } catch (error) {
    return c.json({
      message: "Hacker News Clone API is running!",
      jwtSecretKey: c.env.JWT_SECRET ? "Set" : "Not set",
      jwtSecret: c.env.JWT_SECRET ? "Set" : "Not set",
      database: "Error",
      error: (error as Error).message,
    });
  }
});

export default app;
