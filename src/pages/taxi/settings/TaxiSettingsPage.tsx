import { Tabs } from "antd";
import RideOptionsTab from "./RideOptionsTab";
import FareSettingsTab from "./FareSettingsTab";

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
            ]}
        />
    );
}
