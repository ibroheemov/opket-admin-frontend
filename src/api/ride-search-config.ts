import { api } from "./client";

export type RideSearchConfig = {
    _id?: string;
    searchDurationMs: number;
    maxOffersPerDriver: number;
    reofferAfterMs: number;
    stage1RadiusKm: number;
    stage1TtlMs: number;
    stage1BatchSize: number;
    stage2RadiusKm: number;
    stage2TtlMs: number;
    stage2BatchSize: number;
    stage3RadiusKm: number;
    stage3TtlMs: number;
    stage4RadiusKm: number;
    stage4TtlMs: number;
};

export const RideSearchConfigAPI = {
    get: async (): Promise<RideSearchConfig> => {
        const { data } = await api.get<{ success: boolean; config: RideSearchConfig }>("/ride-search-config");
        return data.config;
    },

    update: async (payload: Partial<RideSearchConfig>): Promise<RideSearchConfig> => {
        const { data } = await api.put<{ success: boolean; config: RideSearchConfig }>("/ride-search-config", payload);
        return data.config;
    },
};
