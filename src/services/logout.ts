import { session } from "./session";

export const logout = () => {
  session.clear();
  window.location.href = "/login";
};