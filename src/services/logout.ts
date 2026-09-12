import { session } from "./session";

export function logout() {
  session.clear();
  window.location.href = "/login";
}
