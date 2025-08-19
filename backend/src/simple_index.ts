import { Hono } from "hono";
import simpleRoutes from "./simple";

const app = new Hono();

app.route("/simple", simpleRoutes);

app.get("/", (c) => {
  return c.json({ 
    message: "Hacker News Clone API is running!",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export default app;
