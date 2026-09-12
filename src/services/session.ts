import type { LoginResponse, User, UserRole } from "../types/User";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const ROLE_KEY = "role";

export const session = {
  setSession(data: LoginResponse) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(ROLE_KEY, data.user.role);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRole(): UserRole | null {
    return localStorage.getItem(ROLE_KEY) as UserRole | null;
  },

  getUser(): User | null {
    const value = localStorage.getItem(USER_KEY);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as User;
    } catch {
      return null;
    }
  },

  getStoreId(): number | null {
    return this.getUser()?.storeId ?? null;
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};
