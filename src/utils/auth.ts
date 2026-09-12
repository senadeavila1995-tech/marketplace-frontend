import { session } from "../services/session";

export const getToken = () => session.getToken();

export const isAuthenticated = () =>
  session.isAuthenticated();

export const getRole = () => session.getRole();

export const getCurrentUser = () =>
  session.getUser();
