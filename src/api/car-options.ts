import { api } from "./client";

export type CarOptionType = "car_model" | "car_color";

export type CarOption = {
    _id: string;
    type: CarOptionType;
    value: string;
    sort_order: number;
    createdAt?: string;
    updatedAt?: string;
};

export type CarOptionPayload = {
    type: CarOptionType;
    value: string;
    sort_order: number;
};

export const CarOptionsAPI = {
    list: async (type?: CarOptionType) => {
        const url = type ? `/car-options/${type}` : "/car-options";
        const { data } = await api.get<CarOption[]>(url);
        return Array.isArray(data) ? data : [];
    },

    create: async (payload: CarOptionPayload) => {
        const { data } = await api.post<CarOption>("/car-options", payload);
        return data;
    },

    update: async (id: string, payload: Partial<CarOptionPayload>) => {
        const { data } = await api.put<CarOption>(`/car-options/${id}`, payload);
        return data;
    },

    remove: async (id: string) => {
        const { data } = await api.delete<{ message?: string }>(`/car-options/${id}`);
        return data;
    },
};
