import { api } from "./client";

/* ===========================
   Types
=========================== */

export type RestaurantOwner = {
    _id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role: "RESTAURANT_OWNER";
    isActive: boolean;
    createdAt?: string;
};

export type GetRestaurantOwnersParams = {
    page?: number;
    pageSize?: number;
    q?: string;
    onlyActive?: boolean;
};

export type GetRestaurantOwnersResponse = {
    ok: boolean;
    owners: RestaurantOwner[];
    meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

export type CreateRestaurantOwnerPayload = {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    createRestaurant?: false; // explicitly no restaurant creation
};

/* ===========================
   API
=========================== */

export const RestaurantOwnersAPI = {
    /* Create owner */
    createRestaurantOwner: (payload: CreateRestaurantOwnerPayload) =>
        api.post(`/admin/restaurant-owners`, payload),

    /* Get owners list */
    getRestaurantOwners: (params?: GetRestaurantOwnersParams) =>
        api.get<GetRestaurantOwnersResponse>(`/admin/restaurant-owners`, {
            params: {
                page: params?.page,
                pageSize: params?.pageSize,
                q: params?.q?.trim() || undefined,
                onlyActive: params?.onlyActive ? "true" : undefined,
            },
        }),
};