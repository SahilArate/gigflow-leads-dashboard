import { api } from "./api";
import { ApiResponse, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      payload
    );
    return data.data!;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      payload
    );
    return data.data!;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return data.data!.user;
  },
};