const USER_KEY = "user";
const TOKEN_KEY = "token";
const ROLE_KEY = "role";

export const session = {
  setSession: (data: any) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(ROLE_KEY, data.role);

    // 🔥 IMPORTANTE: siempre guardar user completo
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  getRole: () => localStorage.getItem(ROLE_KEY),

  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  getStoreId: () => {
    const user = session.getUser();
    return user?.storeId || null;
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
  },
};