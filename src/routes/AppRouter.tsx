import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import AdminLayout from "../layouts/AdminLayout";
import RidesPage from "../pages/rides/RidesPage";
import DriversPage from "../pages/drivers/DriversPage";
import RestaurantsPage from "../pages/restaurants/RestaurantsPage";
import RestaurantDetailPage from "../pages/restaurants/RestaurantDetailPage";
import SettingsPage from "../pages/food/settings/SettingsPage";

export function AppRouter() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected app */}
            <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="taxi/orders" element={<RidesPage />} />
                    <Route path="taxi/drivers" element={<DriversPage />} />
                    <Route path="food/restaurants" element={<RestaurantsPage />} />
                    <Route path="food/settings" element={<SettingsPage />} />
                    <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
    );
}
