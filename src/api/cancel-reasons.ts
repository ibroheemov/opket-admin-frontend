import { api } from "./client";

export type CancelReason = {
    _id: string;
    key: string;
    labelUz: string;
    count: number;
    order: number;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateCancelReason = {
    key: string;
    labelUz: string;
    order?: number;
    active?: boolean;
};

export type UpdateCancelReason = {
    labelUz?: string;
    order?: number;
    active?: boolean;
};

export const CancelReasonsAPI = {
    list: async (): Promise<CancelReason[]> => {
        const res = await api.get<{ reasons: CancelReason[] }>("/admin/cancel-reasons");
        return res.data.reasons ?? [];
    },

    create: async (payload: CreateCancelReason): Promise<CancelReason> => {
        const res = await api.post<CancelReason>("/admin/cancel-reasons", payload);
        return res.data;
    },

    update: async (id: string, patch: UpdateCancelReason): Promise<CancelReason> => {
        const res = await api.patch<CancelReason>(`/admin/cancel-reasons/${id}`, patch);
        return res.data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/admin/cancel-reasons/${id}`);
    },

    resetCount: async (id: string): Promise<CancelReason> => {
        const res = await api.post<CancelReason>(
            `/admin/cancel-reasons/${id}/reset-count`,
            {}
        );
        return res.data;
    },
};
