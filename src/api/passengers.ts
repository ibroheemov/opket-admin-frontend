import { api } from "./client";

export type Passenger = {
    _id: string;
    phone: number;
    balance: number;
    chatId?: number;
    verified?: boolean;
    appVersion?: string;
    notificationEnabled?: boolean;
    currentRideId?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type GetPassengersResponse = {
    ok: boolean;
    passengers: Passenger[];
    meta: { page: number; pageSize: number; total: number; totalPages: number };
};

export const PassengerAPI = {
    list: async (params: { page?: number; pageSize?: number; q?: string }): Promise<GetPassengersResponse> => {
        const { data } = await api.get<GetPassengersResponse>("/admin/passengers", { params });
        return data;
    },

    update: async (id: string, payload: { balance: number }): Promise<Passenger> => {
        const { data } = await api.patch<{ ok: boolean; passenger: Passenger }>(
            `/admin/passengers/${id}`,
            payload
        );
        return data.passenger;
    },
};
