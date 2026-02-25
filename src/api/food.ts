import { api } from "./client";

export const FoodAPI = {
    categories: () =>
        api.get(`/food/categories`),
    createCategory: (formData: FormData) =>
        api.post(`/food/categories`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    updateCategory: (id: string, formData: FormData) =>
        api.patch(`/food/categories/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    deleteCategory: (id: string) =>
        api.delete(`/food/categories/${id}`),


    // RESTAURANT_TYPES
    restaurantTypes: () =>
        api.get(`/admin/restaurant-types`),
    createrestaurantType: (formData: FormData) =>
        api.post(`/admin/restaurant-types`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    updaterestaurantType: (id: string, formData: FormData) =>
        api.patch(`/admin/restaurant-types/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    deleterestaurantType: (id: string) =>
        api.delete(`/admin/restaurant-types/${id}`),
};