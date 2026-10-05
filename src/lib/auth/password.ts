import "server-only";
import { hash, verify } from "@node-rs/argon2";

export const hashPassword = (password: string) => hash(password);

export async function verifyPassword(passwordHash: string, password: string) {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}
