import { api } from "./client";

export type ServiceType = "DELIVERY" | "DINE_IN";

export interface OrderStats {
    serviceType: ServiceType;
    today: { count: number; revenue: number };
    week: { count: number; revenue: number };
    month: { count: number; revenue: number };
    active: { count: number };
    total: { count: number; revenue: number };
    avgOrderValueToday: number;
}

export const StatsAPI = {
    orders: (serviceType: ServiceType) =>
        api.get<{ ok: boolean; data: OrderStats }>("/admin/orders/stats", {
            params: { serviceType },
        }),
};
