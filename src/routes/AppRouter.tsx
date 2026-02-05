import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import AdminLayout from "../layouts/AdminLayout";
import RidesPage from "../pages/rides/RidesPage";
import DriversPage from "../pages/drivers/DriversPage";

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
                    <Route path="rides" element={<RidesPage />} />
                    <Route path="drivers" element={<DriversPage />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
    );
}
