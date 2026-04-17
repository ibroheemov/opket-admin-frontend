import { api, publicApi } from "./client";

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

export type RegisterDriverPayload = {
    firstname: string;
    lastname: string;
    car_model: string;
    car_color: string;
    car_number: string;
    region_code: string;
    phone: string;
    password: string;
    driver_license?: File;
};

export type RegisterDriverResponse = {
    message: string;
    driver: Driver & {
        selfie?: { status: string };
        driver_license?: { status: string };
        passport?: { status: string };
        blocked?: boolean;
        hasPremiumCar?: boolean;
        events?: unknown[];
        __v?: number;
    };
    accessToken: string;
    refreshToken: string;
};

export type LoginRequest = { email: string; password: string };

export type LoginResponse = { token: string };

export type RideStatus =
    | "pending"
    | "offered"
    | "accepted"
    | "arrived"
    | "started"
    | "completed"
    | "cancelled";

export type StatusBy = "system" | "user" | "driver" | "admin";

// What statusHistory entries look like on the client
export type RideStatusEvent = {
    status: RideStatus;
    at: string;              // ISO date string (because you .lean() and send JSON)
    by?: StatusBy;
    note?: string;
    distKm?: number;

    // driverId can be:
    // - populated driver object (when you use populate)
    // - string/ObjectId as string (if not populated)
    // - null/undefined
    driverId?:
    | string
    | {
        _id: string;
        name?: string;
        phone?: string;
        carModel?: string;
        carColor?: string;
        carNumber?: string;
    };
};

export type Ride = {
    _id: string;
    userId?: string;
    userPhoneNumber?: number;
    userChatId: number;

    // Top-level driver (populated in list endpoint)
    driverId?: {
        _id?: string;
        carModel: string;
        carColor: string;
        carNumber: string;
        name?: string;
        phone?: string;
    };

    pickup: { lat: number; lon: number; address?: string };
    dropoff?: { lat: number; lon: number; address?: string };

    status: RideStatus;

    // ✅ add this
    statusHistory?: RideStatusEvent[];

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
    register: async (payload: RegisterDriverPayload) => {
        const fd = new FormData();
        fd.append("firstname", payload.firstname);
        fd.append("lastname", payload.lastname);
        fd.append("car_model", payload.car_model);
        fd.append("car_color", payload.car_color);
        fd.append("car_number", payload.car_number);
        fd.append("region_code", payload.region_code);
        fd.append("phone", payload.phone);
        fd.append("password", payload.password);
        if (payload.driver_license) fd.append("driver_license", payload.driver_license);

        const { data } = await publicApi.post<RegisterDriverResponse>("/driver/register", fd);
        return data;
    },
};

export type OnlineDriver = {
    driverId: string | Driver;
    latitude: number;
    longitude: number;
};

export type GetOnlineDriversResponse = {
    count: number;
    drivers: OnlineDriver[];
};

export const OnlineDriversAPI = {
    list: async () => {
        const { data } = await api.get<GetOnlineDriversResponse>("/drivers/online-drivers");
        return data;
    },
};