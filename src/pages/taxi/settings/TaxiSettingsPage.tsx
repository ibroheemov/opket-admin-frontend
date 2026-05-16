import { Tabs } from "antd";
import RideOptionsTab from "./RideOptionsTab";
import FareSettingsTab from "./FareSettingsTab";
import DriverSearchSettingsTab from "./DriverSearchSettingsTab";
import ReferralSettingsTab from "./ReferralSettingsTab";
import CarOptionsTab from "./CarOptionsTab";
import DiscountSettingsTab from "./DiscountSettingsTab";
import CancelReasonsTab from "./CancelReasonsTab";
import CashbackSettingsTab from "./CashbackSettingsTab";
import AppVersionSettingsTab from "./AppVersionSettingsTab";

export default function TaxiSettingsPage() {
    return (
        <Tabs
            items={[
                {
                    key: "ride-options",
                    label: "Sayohat variantlari",
                    children: <RideOptionsTab />,
                },
                {
                    key: "fare-settings",
                    label: "Tarif sozlamalari",
                    children: <FareSettingsTab />,
                },
                {
                    key: "driver-search-settings",
                    label: "Haydovchi qidirish sozlamalari",
                    children: <DriverSearchSettingsTab />,
                },
                {
                    key: "referral-settings",
                    label: "Referral tizimi",
                    children: <ReferralSettingsTab />,
                },
                {
                    key: "discount-settings",
                    label: "Chegirmalar",
                    children: <DiscountSettingsTab />,
                },
                {
                    key: "cancel-reasons",
                    label: "Bekor qilish sabablari",
                    children: <CancelReasonsTab />,
                },
                {
                    key: "car-options",
                    label: "Avtomobil modellari va ranglari",
                    children: <CarOptionsTab />,
                },
                {
                    key: "cashback-settings",
                    label: "Keshbek",
                    children: <CashbackSettingsTab />,
                },
                {
                    key: "app-version-settings",
                    label: "Ilova versiyalari",
                    children: <AppVersionSettingsTab />,
                },
            ]}
        />
    );
}
