import { Tabs } from "antd";
import RideOptionsTab from "./RideOptionsTab";

export default function TaxiSettingsPage() {
    return (
        <Tabs
            items={[
                {
                    key: "ride-options",
                    label: "Sayohat variantlari",
                    children: <RideOptionsTab />,
                },
            ]}
        />
    );
}
