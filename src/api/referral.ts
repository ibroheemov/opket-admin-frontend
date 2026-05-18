import { api } from "./client";

export type ReferralBonusSettings = {
    driverReferralBonus: number;
    passengerReferralBonus: number;
};

export type PassengerToPassengerReferralBonusSettings = {
    passengerToPassengerReferralBonus: number;
};

export type RegistrationBonusSettings = {
    driverRegistrationBonus: number;
};

export type ReferralZoneSettings = {
    lat: number;
    lng: number;
    radiusKm: number;
};

export type ReferralStatus = "pending_location" | "approved" | "rejected";

export type ReferralRecord = {
    _id: string;
    status: ReferralStatus;
    referredUserType: "driver" | "passenger";
    bonusAmount: number;
    /** true once the referrer driver's bonus has actually been credited */
    bonusCredited: boolean;
    /** true if the status was decided automatically by the zone-radius check */
    autoVerified: boolean;
    referredLocation: { lat: number; lng: number } | null;
    createdAt: string;
    verifiedAt?: string;
    referrer: { _id: string; firstname: string; lastname: string; phone: string } | null;
    referred: { _id: string; firstname?: string; lastname?: string; phone: string | number } | null;
};

export type ReferralListResponse = {
    ok: boolean;
    records: ReferralRecord[];
    meta: { page: number; pageSize: number; total: number; totalPages: number };
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

    listReferrals: async (params: {
        status?: string;
        page?: number;
        pageSize?: number;
    }): Promise<ReferralListResponse> => {
        const res = await api.get<ReferralListResponse>("/admin/referrals", { params });
        return res.data;
    },

    approveReferral: async (id: string): Promise<void> => {
        await api.post(`/admin/referrals/${id}/approve`);
    },

    rejectReferral: async (id: string): Promise<void> => {
        await api.post(`/admin/referrals/${id}/reject`);
    },

    getRegistrationBonus: async (): Promise<RegistrationBonusSettings> => {
        const res = await api.get<RegistrationBonusSettings>("/admin/settings/registration-bonus");
        return res.data;
    },

    updateRegistrationBonus: async (amount: number): Promise<RegistrationBonusSettings> => {
        const res = await api.put<{ success: boolean; driverRegistrationBonus: number }>(
            "/admin/settings/registration-bonus",
            { amount }
        );
        return { driverRegistrationBonus: res.data.driverRegistrationBonus };
    },

    getPassengerToPassengerBonus: async (): Promise<PassengerToPassengerReferralBonusSettings> => {
        const res = await api.get<PassengerToPassengerReferralBonusSettings>(
            "/admin/settings/passenger-to-passenger-referral-bonus"
        );
        return res.data;
    },

    updatePassengerToPassengerBonus: async (amount: number): Promise<PassengerToPassengerReferralBonusSettings> => {
        const res = await api.put<{ success: boolean; passengerToPassengerReferralBonus: number }>(
            "/admin/settings/passenger-to-passenger-referral-bonus",
            { amount }
        );
        return { passengerToPassengerReferralBonus: res.data.passengerToPassengerReferralBonus };
    },
};
