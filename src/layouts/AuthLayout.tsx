import { Layout } from "antd";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Layout.Content style={{ display: "grid", placeItems: "center", padding: 24 }}>
                {children}
            </Layout.Content>
        </Layout>
    );
}
