export type UserRole = "ADMIN" | "SELLER" | "CUSTOMER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  storeId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "SELLER";
}

export interface LoginResponse {
  token: string;
  user: User;
}
