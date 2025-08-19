import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ 
    message: "Hacker News Clone API is running!",
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      JWT_SECRET: "Set",
      DB: "Available"
    }
  });
});

export default app;
