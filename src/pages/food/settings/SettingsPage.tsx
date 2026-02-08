import { Tabs } from "antd";

import FoodCategoriesTab from "./FoodCategoriesTab";

export default function SettingsPage() {

    return (
        <Tabs
            items={[
                { key: "categories", label: "Categories", children: <FoodCategoriesTab /> },
            ]}
        />
    );
}