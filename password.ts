import { Argon2id } from "oslo/password";

const argon2id = new Argon2id();
export async function hashPassword(password: string) {
  const hash = await argon2id.hash(password);
  return hash;
}

export async function verifyPassword({
  password,
  hashedPassword,
}: {
  password: string;
  hashedPassword: string;
}) {
  const isMatch = await argon2id.verify(password, hashedPassword);
  return isMatch;
}
