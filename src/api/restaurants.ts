// src/api/restaurants.ts
import { api } from "./client";

export const RestaurantsAPI = {
    list: (params: any) => api.get("/restaurants", { params }),
    create: (data: any) => api.post("/restaurants", data),
    getById: (id: string) => api.get(`/restaurants/${id}`),
    update: (id: string, data: any) => api.patch(`/restaurants/${id}`, data),
};