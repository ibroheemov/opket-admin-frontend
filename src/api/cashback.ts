import { api } from "./client";

export const CashbackAPI = {
    getSettings: async (): Promise<{ cashback: number }> => {
        const res = await api.get<{ cashback: number }>("/admin/settings/cashback");
        return { cashback: res.data.cashback ?? 0 };
    },

    updateSettings: async (amount: number): Promise<{ cashback: number }> => {
        const res = await api.put<{ success: boolean; cashback: number }>(
            "/admin/settings/cashback",
            { amount }
        );
        return { cashback: res.data.cashback };
    },
};
