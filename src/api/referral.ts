import { api } from "./client";

export type ReferralBonusSettings = {
    driverReferralBonus: number;
    passengerReferralBonus: number;
};

export type ReferralZoneSettings = {
    lat: number;
    lng: number;
    radiusKm: number;
};

export const ReferralAPI = {
    getSettings: async (): Promise<ReferralBonusSettings> => {
        const [driverRes, passengerRes] = await Promise.all([
            api.get<{ driverReferralBonus: number }>("/admin/settings/referral-bonus"),
            api.get<{ passengerReferralBonus: number }>("/admin/settings/passenger-referral-bonus"),
        ]);
        return {
            driverReferralBonus: driverRes.data.driverReferralBonus,
            passengerReferralBonus: passengerRes.data.passengerReferralBonus,
        };
    },

    updateDriverBonus: async (amount: number): Promise<{ driverReferralBonus: number }> => {
        const res = await api.put<{ success: boolean; driverReferralBonus: number }>(
            "/admin/settings/referral-bonus",
            { amount }
        );
        return { driverReferralBonus: res.data.driverReferralBonus };
    },

    updatePassengerBonus: async (amount: number): Promise<{ passengerReferralBonus: number }> => {
        const res = await api.put<{ success: boolean; passengerReferralBonus: number }>(
            "/admin/settings/passenger-referral-bonus",
            { amount }
        );
        return { passengerReferralBonus: res.data.passengerReferralBonus };
    },

    getZone: async (): Promise<ReferralZoneSettings> => {
        const res = await api.get<ReferralZoneSettings>("/admin/settings/referral-zone");
        return {
            lat: Number(res.data.lat) || 0,
            lng: Number(res.data.lng) || 0,
            radiusKm: Number(res.data.radiusKm) || 0,
        };
    },

    updateZone: async (zone: ReferralZoneSettings): Promise<ReferralZoneSettings> => {
        const res = await api.put<{ success: boolean } & ReferralZoneSettings>(
            "/admin/settings/referral-zone",
            zone
        );
        return {
            lat: Number(res.data.lat) || 0,
            lng: Number(res.data.lng) || 0,
            radiusKm: Number(res.data.radiusKm) || 0,
        };
    },
};
