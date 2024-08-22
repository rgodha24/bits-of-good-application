import { Hono } from "hono";
import { connectToMongo, User, Animal, TrainingLog } from "./db";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { hashPassword, verifyPassword } from "./password";
import { HTTPException } from "hono/http-exception";
import { createSigner, createVerifier } from "fast-jwt";

await connectToMongo();

type Variables = {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    id: string;
  };
};

const app = new Hono<{ Variables: Variables }>();

// should be in .env but whatever
const key = "very-secret-key";
const signKey = createSigner({ key });
const verifyKey = createVerifier({ key });

app.use(async (c, next) => {
  if (c.req.path.startsWith("/api/user")) {
    return await next();
  }

  // auth is the header `Authorization: Bearer <token>`
  const jwt = c.req.header("Authorization")?.split(" ")[1];
  if (!jwt) {
    throw new HTTPException(401, {
      message: "Unauthorized: no Authorization header",
    });
  }

  try {
    const payload = verifyKey(jwt);
    c.set("user", payload as any);
  } catch (e) {
    throw new HTTPException(401, { message: "Unauthorized: invalid key" });
  }

  return await next();
});

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

    console.log("adding user", data);

    data.password = await hashPassword(data.password);

    try {
      const user = new User(data);
      await user.save();
      return c.json(user);
    } catch (e) {
      throw new HTTPException(500, {
        message: e instanceof Error ? e.message : "Unknown error",
      });
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
      owner: z.string().optional(),
      dateOfBirth: z.coerce.date().optional(),
      profilePicture: z.string().optional(),
    }),
  ),
  async (c) => {
    const data = c.req.valid("json");
    if (!data.owner) {
      const user = c.get("user");
      data.owner = user.id;
    }

    const animal = new Animal(data);
    try {
      await animal.save();
      return c.json(animal);
    } catch (e) {
      throw new HTTPException(500, {
        message: e instanceof Error ? e.message : "Unknown error",
      });
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
      user: z.string().optional(),
      trainingLogVideo: z.string().optional(),
    }),
  ),
  async (c) => {
    const data = c.req.valid("json");

    if (!data.user) {
      const user = c.get("user");
      data.user = user.id;
    }

    const trainingLog = new TrainingLog(data);
    try {
      await trainingLog.save();
      return c.json(trainingLog);
    } catch (e) {
      throw new HTTPException(500, {
        message: e instanceof Error ? e.message : "Unknown error",
      });
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

  const users = await User.find({})
    .select("firstName lastName email profilePicture")
    .limit(count)
    .skip(offset)
    .exec();

  return c.json(users);
});

app.get("/api/admin/training", queryLimitOffset, async (c) => {
  const { count, offset } = c.req.valid("query");
  const trainingLogs = await TrainingLog.find().limit(count).skip(offset);
  return c.json(trainingLogs);
});

app.post(
  "/api/user/login",
  zValidator("json", z.object({ email: z.string(), password: z.string() })),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const user = await User.findOne({ email }).exec();
    if (!user) {
      throw new HTTPException(401, { message: "User not found" });
    }

    const isMatch = await verifyPassword({
      password,
      hashedPassword: user.password,
    });

    if (!isMatch) {
      throw new HTTPException(401, { message: "Invalid password" });
    }

    return c.json({ message: "Logged in" });
  },
);

app.post(
  "/api/user/verify",
  zValidator("json", z.object({ email: z.string(), password: z.string() })),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const user = await User.findOne({ email }).exec();
    if (!user) {
      throw new HTTPException(401, { message: "User not found" });
    }

    const isMatch = await verifyPassword({
      password,
      hashedPassword: user.password,
    });

    if (!isMatch) {
      throw new HTTPException(401, { message: "Invalid password" });
    }

    const token = signKey({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      id: user._id,
    });

    return c.text(token);
  },
);

console.log("ready");

export default app;
