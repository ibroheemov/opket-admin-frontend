import { api } from "./client";

export type FareType = "standard" | "comfort" | "ghost";

export type Fare = {
    _id: string;
    isMandatory: boolean;
    type: FareType;
    baseFare: number;
    perKm: number;
    firstKm: number;
    outsidePerKm: number;
    outsideFirstKm: number;
    perMinute: number;
    minutesBeforeCharge: number;
    smallestDistance: number;
    smallestDistanceFare: number;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
};

export type FarePayload = {
    type: FareType;
    rating: number;
    isMandatory: boolean;
    baseFare: number;
    perKm: number;
    firstKm: number;
    outsidePerKm: number;
    outsideFirstKm: number;
    perMinute: number;
    minutesBeforeCharge: number;
    smallestDistance: number;
    smallestDistanceFare: number;
};

function normalizeList(data: unknown): Fare[] {
    if (Array.isArray(data)) return data as Fare[];
    if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.fares)) return obj.fares as Fare[];
        if (Array.isArray(obj.data)) return obj.data as Fare[];
    }
    return [];
}

export const FaresAPI = {
    list: async () => {
        const { data } = await api.get<Fare[] | unknown>("/fare");
        return normalizeList(data);
    },

    create: async (payload: FarePayload) => {
        const { data } = await api.post<Fare>("/fare", payload);
        return data;
    },

    update: async (id: string, payload: FarePayload) => {
        const { data } = await api.put<Fare>(`/fare/${id}`, payload);
        return data;
    },

    remove: async (id: string) => {
        const { data } = await api.delete<{ message?: string }>(`/fare/${id}`);
        return data;
    },
};
