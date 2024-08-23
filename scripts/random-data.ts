import {
  randFirstName,
  randLastName,
  randEmail,
  randPassword,
  randFullName,
  randNumber,
  randPastDate,
  randSentence,
} from "@ngneat/falso";

const user = () => ({
  firstName: randFirstName(),
  lastName: randLastName(),
  email: randEmail(),
  password: randPassword(),
  profilePicture:
    Math.random() > 0.5 ? "https://example.com/profile.jpg" : undefined,
});

const users: Array<ReturnType<typeof user> & { _id: string }> =
  await Promise.all(
    Array.from({ length: 10 }, user).map((u) =>
      fetch("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(u),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((data) => data.json()),
    ),
  );

const animal = () => ({
  name: randFullName(),
  hoursTrained: randNumber({ min: 0, max: 100 }),
  owner: users[randNumber({ min: 0, max: users.length - 1 })]._id,
  dateOfBirth: randPastDate(),
  profilePicture:
    Math.random() > 0.5 ? "https://example.com/animal.jpg" : undefined,
});

const animals: Array<ReturnType<typeof animal> & { _id: string }> =
  await Promise.all(
    Array.from({ length: 10 }, animal).map((a) =>
      fetch("http://localhost:3000/api/animals", {
        method: "POST",
        body: JSON.stringify(a),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((data) => data.json()),
    ),
  );

const trainingLog = () => ({
  date: randPastDate(),
  description: randSentence(),
  hours: randNumber({ min: 0, max: 10 }),
  animal: animals[randNumber({ min: 0, max: animals.length - 1 })]._id,
  user: users[randNumber({ min: 0, max: users.length - 1 })]._id,
  trainingLogVideo:
    Math.random() > 0.5 ? "https://example.com/training-log.mp4" : undefined,
});

const trainingLogs: Array<ReturnType<typeof trainingLog> & { _id: string }> =
  await Promise.all(
    Array.from({ length: 10 }, trainingLog).map(async (tl) =>
      fetch("http://localhost:3000/api/training", {
        method: "POST",
        body: JSON.stringify(tl),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((data) => data.json()),
    ),
  );
