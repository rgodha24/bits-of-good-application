import {
  connectToMongo,
  User,
  TrainingLog,
  Animal,
  disconnect,
} from "../src/db";

await connectToMongo();

await Promise.all([
  User.deleteMany({}).exec(),
  Animal.deleteMany({}).exec(),
  TrainingLog.deleteMany({}).exec(),
]);

await disconnect();
