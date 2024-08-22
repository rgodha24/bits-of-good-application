import mongoose from "mongoose";

export let db: mongoose.Mongoose = null as any;

export async function connectToMongo() {
  db = await mongoose.connect(process.env.MONGO_URI!, {});
}
export const { disconnect } = mongoose;

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
});

const animalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hoursTrained: { type: Number, required: true, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dateOfBirth: { type: Date },
  profilePicture: { type: String },
});

const trainingLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  hours: { type: Number, required: true },
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Animal",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  trainingLogVideo: { type: String },
});

export const User = mongoose.model("User", userSchema);
export const Animal = mongoose.model("Animal", animalSchema);
export const TrainingLog = mongoose.model("TrainingLog", trainingLogSchema);
