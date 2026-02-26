import { Layout, Menu, Button } from "antd";
import { DashboardOutlined, LogoutOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
    const { logout } = useAuth();
    const location = useLocation();
    const selectedKeys = useMemo(() => {
        const path = location.pathname;

        if (path.startsWith("/app/dashboard")) return ["dashboard"];
        if (path.startsWith("/app/taxi/drivers")) return ["taxi-drivers"];
        if (path.startsWith("/app/taxi/map")) return ["taxi-map"];
        if (path.startsWith("/app/taxi/orders")) return ["taxi-orders"];
        if (path.startsWith("/app/food/restaurants")) return ["food-restaurants"];
        if (path.startsWith("/app/food/orders")) return ["food-orders"];
        if (path.startsWith("/app/food/settings")) return ["food-settings"];
        if (path.startsWith("/app/food/owners")) return ["food-owners"];

        return [];
    }, [location.pathname]);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider collapsible>
                <div style={{ height: 48, margin: 16, color: "white", fontWeight: 700 }}>
                    Admin Panel
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={selectedKeys}
                    items={[
                        {
                            key: "dashboard",
                            icon: <DashboardOutlined />,
                            label: <Link to="/app/dashboard">Dashboard</Link>,
                        },
                        {
                            key: "taxi",
                            icon: <DashboardOutlined />,
                            label: "Taxi",
                            children: [
                                {
                                    key: "taxi-drivers",
                                    label: <Link to="/app/taxi/drivers">Haydovchilar</Link>,
                                },
                                {
                                    key: "taxi-orders",
                                    label: <Link to="/app/taxi/orders">Buyurtmalar</Link>,
                                },
                                {
                                    key: "taxi-map",
                                    label: <Link to="/app/taxi/map">Xarita</Link>,
                                },
                            ],
                        },
                        {
                            key: "food",
                            icon: <DashboardOutlined />,
                            label: "Ovqat",
                            children: [
                                {
                                    key: "food-restaurants",
                                    label: <Link to="/app/food/restaurants">Restoranlar</Link>,
                                },
                                {
                                    key: "food-orders",
                                    label: <Link to="/app/food/orders">Buyurtmalar</Link>,
                                },
                                {
                                    key: "food-owners",
                                    label: <Link to="/app/food/owners">Restoran Egalari</Link>,
                                },
                                {
                                    key: "food-settings",
                                    label: <Link to="/app/food/settings">Sozlamalar</Link>,
                                },
                            ],
                        },
                    ]}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        background: "white",
                        paddingInline: 16,
                        gap: 8,
                    }}
                >
                    <Button icon={<LogoutOutlined />} onClick={logout}>
                        Logout
                    </Button>
                </Header>

                <Content style={{ margin: 16 }}>
                    <div style={{ background: "white", padding: 16, borderRadius: 12, minHeight: 360 }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
