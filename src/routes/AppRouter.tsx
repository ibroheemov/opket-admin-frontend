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
import ReferralApprovalsPage from "../pages/taxi/ReferralApprovalsPage";
import PassengersPage from "../pages/passengers/PassengersPage";
import QrCodesPage from "../pages/food/qr/QrCodesPage";
import QrCodeDetailPage from "../pages/food/qr/QrCodeDetailPage";
import MessagingPage from "../pages/messaging/MessagingPage";
import WorkingAreaPage from "../pages/taxi/WorkingAreaPage";

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
                    <Route path="taxi/referrals" element={<ReferralApprovalsPage />} />
                    <Route path="taxi/passengers" element={<PassengersPage />} />
                    <Route path="taxi/working-areas" element={<WorkingAreaPage />} />
                    <Route path="food/restaurants" element={<RestaurantsPage />} />
                    <Route path="food/settings" element={<SettingsPage />} />
                    <Route path="food/owners" element={<RestaurantOwnersPage />} />
                    <Route path="food/qr-codes" element={<QrCodesPage />} />
                    <Route path="food/qr-codes/:id" element={<QrCodeDetailPage />} />
                    <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
                    <Route path="messaging" element={<MessagingPage />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
    );
}
