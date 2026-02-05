import { api } from "./client";

export type Driver = {
    _id: string;
    firstname: string;
    lastname: string;
    name: string;
    phone: string;
    balance: number;
    carModel: string;
    carNumber: string;
    regionCode: string;
    carColor: string;
    vehicle: string;
    status: "online" | "offline";
    driver_license?: string;
    location?: { lat: number; lon: number };
    currentRideId?: string | null;
    canReceiveOffers: boolean;
    enabledOptions: string[];
    createdAt?: string;
    updatedAt?: string;
};

export type GetDriversResponse = {
    success: boolean;
    drivers: Driver[];
    meta: { page: number; pageSize: number; total: number; totalPages: number };
};

export type LoginRequest = { email: string; password: string };

export type LoginResponse = { token: string };

export type Ride = {
    _id: string;
    userId?: string;
    userPhoneNumber?: number;
    userChatId: number;
    driverId?: { carModel: string, carColor: string, carNumber: string };
    pickup: { lat: number; lon: number; address?: string };
    dropoff?: { lat: number; lon: number; address?: string };
    status: "pending" | "offered" | "accepted" | "arrived" | "started" | "completed" | "cancelled";
    fare: number;
    fareEstimate?: number;
    distanceKm?: number;
    createdAt?: string;
    startedAt?: string;
    endedAt?: string;
    luggage: boolean;
    type: "app" | "bot";
    rideType: "standard" | "premium" | "comfort";
    distanceTraveled: number;
    offeredTo?: string;
    offerExpiresAt?: string;
    candidateDrivers: { driverId: string; distKm: number }[];
    lastLocation?: { lat: number; lon: number };
};

export type GetRidesResponse = {
    success: boolean;
    rides: Ride[];
    meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

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

export const RideAPI = {
    list: async (params: Record<string, any>) => {
        const { data } = await api.get<GetRidesResponse>("/ride/rides-all", { params });
        return data;
    },
};

export const DriverAPI = {
    list: async (params: Record<string, any>) => {
        const { data } = await api.get<GetDriversResponse>("/drivers", { params });
        return data;
    },
    update: async (id: string, payload: Partial<Driver>) => {
        const { data } = await api.patch<{ success: boolean; driver: Driver }>(`/drivers/${id}`, payload);
        return data;
    },
};