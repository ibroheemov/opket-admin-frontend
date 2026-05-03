import { api } from "./client";

export type RideOption = {
    _id: string;
    title: string;
    title_for_passenger: string;
    option_id: string;
    instant: boolean;
    charge: number;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
};

export type RideOptionPayload = {
    title: string;
    title_for_passenger: string;
    option_id: string;
    instant: boolean;
    charge: number;
};

function normalizeList(data: unknown): RideOption[] {
    if (Array.isArray(data)) return data;
    return [];
}

export const RideOptionsAPI = {
    list: async () => {
        const { data } = await api.get<RideOption[] | unknown>("/ride-options");
        return normalizeList(data);
    },

    getById: async (id: string) => {
        const { data } = await api.get<RideOption>(`/ride-options/${id}`);
        return data;
    },

    create: async (payload: RideOptionPayload) => {
        const { data } = await api.post<RideOption>("/ride-options", payload);
        return data;
    },

    update: async (id: string, payload: RideOptionPayload) => {
        const { data } = await api.put<RideOption>(`/ride-options/${id}`, payload);
        return data;
    },

    remove: async (id: string) => {
        const { data } = await api.delete<{ message?: string }>(`/ride-options/${id}`);
        return data;
    },
};
