import API from "./api";
import type { User, UserRole } from "../types/User";

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

export async function getUsers(): Promise<User[]> {
  const response = await API.get<User[]>("/Users");
  return response.data;
}

export async function getUserById(
  id: number
): Promise<User> {
  const response = await API.get<User>(
    `/Users/${id}`
  );

  return response.data;
}

export async function createUser(
  data: CreateUserRequest
) {
  const response = await API.post(
    "/Users",
    data
  );

  return response.data;
}

export async function updateUser(
  id: number,
  data: UpdateUserRequest
) {
  const response = await API.put(
    `/Users/${id}`,
    data
  );

  return response.data;
}

export async function deleteUser(id: number) {
  const response = await API.delete(
    `/Users/${id}`
  );

  return response.data;
}
