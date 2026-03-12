import { Tabs } from "antd";
import { useParams } from "react-router-dom";
import CategoriesTab from "./tabs/CategoriesTab";
import ItemsTab from "./tabs/ItemsTab";
import { EditRestaurantPage } from "./tabs/EditRestaurantPage";

export default function RestaurantDetailPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <Tabs
            items={[
                { key: "profile", label: "Profil", children: <EditRestaurantPage restaurantId={id!} /> },
                { key: "categories", label: "Kategoriyalar", children: <CategoriesTab restaurantId={id!} /> },
                { key: "items", label: "Menyu", children: <ItemsTab restaurantId={id!} /> },
            ]}
        />
    );
}
