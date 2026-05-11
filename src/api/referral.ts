import { api } from "./client";

export type ReferralBonusSettings = {
    driverReferralBonus: number;
    passengerReferralBonus: number;
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
};
