import { api } from "./client";

export type LatLng = { lat: number; lng: number };

export type WorkingArea = {
    _id: string;
    name: string;
    polygon: LatLng[];
    fareMultiplierOutside: number;
    createdAt?: string;
    updatedAt?: string;
};

export type WorkingAreaPayload = {
    name: string;
    polygon: LatLng[];
    fareMultiplierOutside: number;
};

export const WorkingAreaAPI = {
    list: async (): Promise<WorkingArea[]> => {
        const { data } = await api.get<{ success: boolean; areas: WorkingArea[] }>("/working-areas");
        return data.areas ?? [];
    },

    create: async (payload: WorkingAreaPayload): Promise<WorkingArea> => {
        const { data } = await api.post<WorkingArea>("/working-areas", payload);
        return data;
    },

    update: async (id: string, payload: WorkingAreaPayload): Promise<WorkingArea> => {
        const { data } = await api.put<WorkingArea>(`/working-areas/${id}`, payload);
        return data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/working-areas/${id}`);
    },
};
