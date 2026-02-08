import { Tabs } from "antd";
import { useParams } from "react-router-dom";
import CategoriesTab from "./tabs/CategoriesTab";
import ItemsTab from "./tabs/ItemsTab";
import ProfileTab from "./tabs/ProfileTab";

export default function RestaurantDetailPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <Tabs
            items={[
                { key: "profile", label: "Profile", children: <ProfileTab restaurantId={id!} /> },
                { key: "categories", label: "Categories", children: <CategoriesTab restaurantId={id!} /> },
                { key: "items", label: "Menu Items", children: <ItemsTab restaurantId={id!} /> },
            ]}
        />
    );
}