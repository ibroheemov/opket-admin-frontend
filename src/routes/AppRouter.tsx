import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import AdminLayout from "../layouts/AdminLayout";
import RidesPage from "../pages/rides/RidesPage";
import DriversPage from "../pages/drivers/DriversPage";
import DriverApprovalsPage from "../pages/drivers/DriverApprovalsPage";
import RestaurantsPage from "../pages/restaurants/RestaurantsPage2";
import RestaurantDetailPage from "../pages/restaurants/RestaurantDetailPage";
import SettingsPage from "../pages/food/settings/SettingsPage";
import RestaurantOwnersPage from "../pages/users/RestaurantOwnersPage";
import OnlineDriversMapPage from "../pages/drivers/OnlineDriversMapPage";
import TaxiSettingsPage from "../pages/taxi/settings/TaxiSettingsPage";
import QrCodesPage from "../pages/food/qr/QrCodesPage";
import QrCodeDetailPage from "../pages/food/qr/QrCodeDetailPage";

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
                    <Route path="taxi/driver-approvals" element={<DriverApprovalsPage />} />
                    <Route path="taxi/map" element={<OnlineDriversMapPage />} />
                    <Route path="taxi/settings" element={<TaxiSettingsPage />} />
                    <Route path="food/restaurants" element={<RestaurantsPage />} />
                    <Route path="food/settings" element={<SettingsPage />} />
                    <Route path="food/owners" element={<RestaurantOwnersPage />} />
                    <Route path="food/qr-codes" element={<QrCodesPage />} />
                    <Route path="food/qr-codes/:id" element={<QrCodeDetailPage />} />
                    <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
    );
}
