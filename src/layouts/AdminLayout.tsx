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
        if (location.pathname.startsWith("/app/dashboard")) return ["dashboard"];
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
                            key: "rides",
                            icon: <DashboardOutlined />,
                            label: <Link to="/app/rides">Buyurtmalar</Link>,
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
