import axios from "axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../types/User";
import { session } from "../services/session";

const API_URL = "http://localhost:5108/api/Auth";

export async function login(
  data: LoginRequest
): Promise<LoginResponse> {
  const response = await axios.post<LoginResponse>(
    `${API_URL}/login`,
    data
  );

  session.setSession(response.data);

  return response.data;
}

export async function register(
  data: RegisterRequest
) {
  const response = await axios.post(
    `${API_URL}/register`,
    data
  );

  return response.data;
}

export function logout() {
  session.clear();
}
