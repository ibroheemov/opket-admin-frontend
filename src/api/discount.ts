import { api } from "./client";

export type DiscountType = "percentage" | "fixed";

export type DiscountTier = {
    minFare: number;
    maxFare: number | null;
    type: DiscountType;
    value: number;
};

export type DiscountConfig = {
    enabled: boolean;
    tiers: DiscountTier[];
};

export const DiscountAPI = {
    get: async (): Promise<DiscountConfig> => {
        const res = await api.get<DiscountConfig>("/admin/settings/discount-config");
        return {
            enabled: !!res.data.enabled,
            tiers: Array.isArray(res.data.tiers) ? res.data.tiers : [],
        };
    },

    update: async (payload: DiscountConfig): Promise<DiscountConfig> => {
        const res = await api.put<{ success: boolean } & DiscountConfig>(
            "/admin/settings/discount-config",
            payload
        );
        return {
            enabled: !!res.data.enabled,
            tiers: Array.isArray(res.data.tiers) ? res.data.tiers : [],
        };
    },
};
