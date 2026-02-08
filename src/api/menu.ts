import { api } from "./client";


export const MenuAPI = {
    categories: (restaurantId: string) =>
        api.get(`/menu/restaurants/${restaurantId}/categories`),

    createCategory: (restaurantId: string, data: any) =>
        api.post(`/menu/restaurants/${restaurantId}/categories`, data),

    updateCategory: (id: string, data: any) =>
        api.patch(`/menu/categories/${id}`, data),

    deleteCategory: (id: string) =>
        api.delete(`/menu/categories/${id}`),

    items: (restaurantId: string, params?: any) =>
        api.get(`/menu/restaurants/${restaurantId}/items`, { params }),

    createItem: (restaurantId: string, fd: FormData) =>
        api.post(`/menu/restaurants/${restaurantId}/items`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    updateItem: (id: string, fd: FormData) =>
        api.patch(`/menu/items/${id}`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    deleteItem: (id: string) =>
        api.delete(`/menu/items/${id}`),

    optionGroups: (itemId: string) =>
        api.get(`/menu/items/${itemId}/option-groups`),

    createOptionGroup: (itemId: string, data: any) =>
        api.post(`/menu/items/${itemId}/option-groups`, data),

    deleteOptionGroup: (id: string) =>
        api.delete(`/menu/option-groups/${id}`),

    options: (groupId: string) =>
        api.get(`/menu/option-groups/${groupId}/options`),

    createOption: (groupId: string, data: any) =>
        api.post(`/menu/option-groups/${groupId}/options`, data),

    updateOption: (id: string, data: any) =>
        api.patch(`/menu/options/${id}`, data),

    deleteOption: (id: string) =>
        api.delete(`/menu/options/${id}`),
};