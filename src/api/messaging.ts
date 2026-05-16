import { api } from "./client";

export type EskizTemplate = {
    id: number;
    template: string;
    original_text: string;
    status: string;
};

export type SendMessagePayload = {
    targetType: "driver" | "passenger";
    ids: string[] | "all";
    title: string;
    text: string;
};

export type EskizBatchResult = {
    id: string;
    message: string;
    status: string | string[];
};

export type SendMessageResult = {
    ok: boolean;
    fcm: { sent: number; successCount: number; failureCount: number };
    sms: { sent: number; result: EskizBatchResult | null };
};

export const MessagingAPI = {
    getTemplates: async (): Promise<EskizTemplate[]> => {
        const { data } = await api.get<{ ok: boolean; templates: EskizTemplate[] }>("/messaging/templates");
        return data.templates;
    },

    send: async (payload: SendMessagePayload): Promise<SendMessageResult> => {
        const { data } = await api.post<SendMessageResult>("/messaging/send", payload);
        return data;
    },
};
