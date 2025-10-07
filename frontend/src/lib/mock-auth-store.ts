import argon2 from "argon2";

type User = {
  id: string;
  name?: string;
  email: string;
  passwordHash?: string;
  provider?: string;
};

const users = new Map<string, User>();
const sessions = new Map<string, string>();

export async function createUser(email: string, password?: string, name?: string, provider?: string) {
  const id = cryptoRandomId();
  const user: User = { id, email, name, provider };
  if (password) {
    user.passwordHash = await argon2.hash(password);
  }
  users.set(email.toLowerCase(), user);
  return user;
}

export async function verifyUser(email: string, password: string) {
  const u = users.get(email.toLowerCase());
  if (!u || !u.passwordHash) return null;
  const ok = await argon2.verify(u.passwordHash, password);
  return ok ? u : null;
}

export function findUserByEmail(email: string) {
  return users.get(email.toLowerCase()) ?? null;
}

export function createSession(userId: string) {
  const token = cryptoRandomId();
  sessions.set(token, userId);
  return token;
}

export function getUserIdBySession(token: string) {
  return sessions.get(token) ?? null;
}

function cryptoRandomId() {
  // simple random id
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
