import { api } from "./client";

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string };

export const AuthAPI = {
    login: async (payload: LoginRequest) => {
        const { data } = await api.post<LoginResponse>("/auth/login", payload);
        return data;
    },
};

export const HealthAPI = {
    ping: async () => {
        const { data } = await api.get<{ ok: boolean }>("/health");
        return data;
    },
};
