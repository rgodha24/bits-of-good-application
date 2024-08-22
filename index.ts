import { Hono } from "hono";
import { connectToMongo, User, Animal, TrainingLog } from "./db";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

await connectToMongo();

const app = new Hono();
app.get("/", (c) => c.text("Hello Bun!!"));
app.get("/api/health", (c) => c.json({ healthy: true }));

app.post(
  "/api/users",
  zValidator(
    "json",
    z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      password: z.string(),
      profilePicture: z.string().optional(),
    }),
  ),
  async (c) => {
    const data = c.req.valid("json");
    try {
      const user = new User(data);
      await user.save();
      return c.json(user);
    } catch (e) {
      return c.json(e as any);
    }
  },
);
app.post(
  "/api/animals",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      hoursTrained: z.number(),
      owner: z.string(),
      dateOfBirth: z.coerce.date().optional(),
      profilePicture: z.string().optional(),
    }),
  ),
  async (c) => {
    const data = c.req.valid("json");
    const animal = new Animal(data);
    try {
      await animal.save();
      return c.json(animal);
    } catch (e) {
      return c.json(e as any);
    }
  },
);
app.post(
  "/api/training",
  zValidator(
    "json",
    z.object({
      date: z.coerce.date(),
      description: z.string(),
      hours: z.number(),
      animal: z.string(),
      user: z.string(),
      trainingLogVideo: z.string().optional(),
    }),
  ),
  async (c) => {
    const data = c.req.valid("json");
    const trainingLog = new TrainingLog(data);
    try {
      await trainingLog.save();
      return c.json(trainingLog);
    } catch (e) {
      return c.json(e as any);
    }
  },
);

const queryLimitOffset = zValidator(
  "query",
  z.object({
    count: z.coerce.number().min(1).max(50).optional().default(10),
    offset: z.coerce.number().min(0).optional().default(0),
  }),
);

app.get("/api/admin/animals", queryLimitOffset, async (c) => {
  const { count, offset } = c.req.valid("query");
  const animals = await Animal.find().limit(count).skip(offset);
  return c.json(animals);
});

app.get("/api/admin/users", queryLimitOffset, async (c) => {
  const { count, offset } = c.req.valid("query");
  console.log(count, offset);
  const users = await User.find({})
    .select("firstName lastName email profilePicture")
    .limit(count)
    .skip(offset)
    .exec();

  console.log(users);

  return c.json(users);
});

app.get("/api/admin/training", queryLimitOffset, async (c) => {
  const { count, offset } = c.req.valid("query");
  const trainingLogs = await TrainingLog.find().limit(count).skip(offset);
  return c.json(trainingLogs);
});

console.log("ready");

export default app;

