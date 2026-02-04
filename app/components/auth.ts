export type Role = "Parent" | "Teacher" | "Relative";

const USER_KEY = "zeyin.user.v1";

export function setUser(u: { name: string; role: Role }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(u));
}

export function getUser(): { name: string; role: Role } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.name || !parsed?.role) return null;
    return parsed as { name: string; role: Role };
  } catch {
    return null;
  }
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}
