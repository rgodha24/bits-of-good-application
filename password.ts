import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

export async function verifyPassword({
  password,
  hashedPassword,
}: {
  password: string;
  hashedPassword: string;
}) {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}
