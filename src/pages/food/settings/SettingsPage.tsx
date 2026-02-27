import { Tabs } from "antd";

import FoodCategoriesTab from "./FoodCategoriesTab";
import RestaurantTypesTab from "./RestaurantTypesTab";

export default function SettingsPage() {

    return (
        <Tabs
            items={[
                { key: "categories", label: "Kategoriyalar", children: <FoodCategoriesTab /> },
                { key: "restaurant-types", label: "Yo'nalishlar", children: <RestaurantTypesTab /> },
            ]}
        />
    );
}
