import { Tabs } from "antd";
import RideOptionsTab from "./RideOptionsTab";
import FareSettingsTab from "./FareSettingsTab";
import DriverSearchSettingsTab from "./DriverSearchSettingsTab";
import ReferralSettingsTab from "./ReferralSettingsTab";
import CarOptionsTab from "./CarOptionsTab";

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
                    key: "car-options",
                    label: "Avtomobil modellari va ranglari",
                    children: <CarOptionsTab />,
                },
            ]}
        />
    );
}
