import { api } from "./client";

export interface AppVersionConfig {
    passenger_min_version: string;
    passenger_latest_version: string;
    driver_min_version: string;
    driver_latest_version: string;
}

export const AppVersionAPI = {
    getConfig: async (): Promise<AppVersionConfig> => {
        const { data } = await api.get<AppVersionConfig>("/admin/settings/app-version-config");
        return data;
    },

    updateConfig: async (payload: AppVersionConfig): Promise<AppVersionConfig> => {
        const { data } = await api.put<{ success: boolean; data: AppVersionConfig }>(
            "/admin/settings/app-version-config",
            payload
        );
        return data.data;
    },
};
