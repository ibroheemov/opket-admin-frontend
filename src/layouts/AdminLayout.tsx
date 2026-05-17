import { Layout, Menu, Button, Badge } from "antd";
import { DashboardOutlined, LogoutOutlined, FileSearchOutlined, GiftOutlined, SendOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { DriverAPI } from "../api/endpoints";
import { ReferralAPI } from "../api/referral";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
    const { logout } = useAuth();
    const location = useLocation();
    const [pendingApprovals, setPendingApprovals] = useState(0);
    const [pendingReferrals, setPendingReferrals] = useState(0);

    useEffect(() => {
        DriverAPI.list({ documentsApproved: "false", pageSize: 1 })
            .then((res) => setPendingApprovals(res.meta.total))
            .catch(() => {});
        ReferralAPI.listReferrals({ status: "pending_location", pageSize: 1 })
            .then((res) => setPendingReferrals(res.meta.total))
            .catch(() => {});
    }, []);

    const selectedKeys = useMemo(() => {
        const path = location.pathname;

        if (path.startsWith("/app/dashboard")) return ["dashboard"];
        if (path.startsWith("/app/taxi/driver-approvals")) return ["taxi-driver-approvals"];
        if (path.startsWith("/app/taxi/drivers")) return ["taxi-drivers"];
        if (path.startsWith("/app/taxi/map")) return ["taxi-map"];
        if (path.startsWith("/app/taxi/orders")) return ["taxi-orders"];
        if (path.startsWith("/app/taxi/referrals")) return ["taxi-referrals"];
        if (path.startsWith("/app/taxi/passengers")) return ["taxi-passengers"];
        if (path.startsWith("/app/taxi/working-areas")) return ["taxi-working-areas"];
        if (path.startsWith("/app/taxi/settings")) return ["taxi-settings"];
        if (path.startsWith("/app/food/restaurants")) return ["food-restaurants"];
        if (path.startsWith("/app/food/orders")) return ["food-orders"];
        if (path.startsWith("/app/food/settings")) return ["food-settings"];
        if (path.startsWith("/app/food/owners")) return ["food-owners"];
        if (path.startsWith("/app/food/qr-codes")) return ["food-qr-codes"];
        if (path.startsWith("/app/messaging")) return ["messaging"];

        return [];
    }, [location.pathname]);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider collapsible>
                <div style={{ height: 48, margin: 16, color: "white", fontWeight: 700 }}>
                    Boshqaruv Paneli
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={selectedKeys}
                    items={[
                        {
                            key: "dashboard",
                            icon: <DashboardOutlined />,
                            label: <Link to="/app/dashboard">Bosh sahifa</Link>,
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
                                    key: "taxi-driver-approvals",
                                    icon: <FileSearchOutlined />,
                                    label: (
                                        <Link to="/app/taxi/driver-approvals">
                                            <Badge count={pendingApprovals} size="small" offset={[6, -2]}>
                                                Hujjat tasdiqlash
                                            </Badge>
                                        </Link>
                                    ),
                                },
                                {
                                    key: "taxi-orders",
                                    label: <Link to="/app/taxi/orders">Buyurtmalar</Link>,
                                },
                                {
                                    key: "taxi-map",
                                    label: <Link to="/app/taxi/map">Xarita</Link>,
                                },
                                {
                                    key: "taxi-referrals",
                                    icon: <GiftOutlined />,
                                    label: (
                                        <Link to="/app/taxi/referrals">
                                            <Badge count={pendingReferrals} size="small" offset={[6, -2]}>
                                                Referrallar
                                            </Badge>
                                        </Link>
                                    ),
                                },
                                {
                                    key: "taxi-passengers",
                                    label: <Link to="/app/taxi/passengers">Yo'lovchilar</Link>,
                                },
                                {
                                    key: "taxi-working-areas",
                                    label: <Link to="/app/taxi/working-areas">Ish hududlari</Link>,
                                },
                                {
                                    key: "taxi-settings",
                                    label: <Link to="/app/taxi/settings">Sozlamalar</Link>,
                                },
                            ],
                        },
                        {
                            key: "messaging",
                            icon: <SendOutlined />,
                            label: <Link to="/app/messaging">Xabar yuborish</Link>,
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
                                    key: "food-qr-codes",
                                    label: <Link to="/app/food/qr-codes">QR Kodlar</Link>,
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
                        Chiqish
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
