import { Hono } from "hono";
import { signJwt } from "../auth/jwt";
import { Env, Variables, NewUser } from "../types";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { hashPassword, verifyPassword } from "../auth/jwt";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.post("/register", async (c) => {
  const db = c.get("db");
  const { email, username, password } = await c.req.json();
  
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    return c.json({ error: "User already exists" }, 400);
  }
  
  const hashedPassword = await hashPassword(password);
  const newUser: NewUser = { email, username, password: hashedPassword };
  
  const result = await db.insert(users).values(newUser).returning();
  const user = result[0];
  
  const token = await signJwt({ id: user.id, email: user.email, username: user.username }, c.env);
  
  return c.json({ user: { id: user.id, email: user.email, username: user.username }, token });
});

app.post("/login", async (c) => {
  const db = c.get("db");
  const { email, password } = await c.req.json();
  
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (result.length === 0) {
    return c.json({ error: "Invalid credentials" }, 400);
  }
  
  const user = result[0];
  const validPassword = await verifyPassword(password, user.password);
  if (!validPassword) {
    return c.json({ error: "Invalid credentials" }, 400);
  }
  
  const token = await signJwt({ id: user.id, email: user.email, username: user.username }, c.env);
  
  return c.json({ user: { id: user.id, email: user.email, username: user.username }, token });
});

export default app;
