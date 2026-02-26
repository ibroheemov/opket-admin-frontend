import { Typography, Flex, Button } from "antd";
import { HealthAPI } from "../../api/endpoints";
// import { HealthAPI } from "../../api/endpoints";

export default function Dashboard() {
    const ping = async () => {
        try {
            const res = await HealthAPI.ping();
            alert(JSON.stringify(res));
        } catch {
            alert("Ping failed (check your API base URL / endpoint).");
        }
    };

    return (
        <Flex vertical gap="middle" style={{ width: "100%" }}>
            <Typography.Title level={2} style={{ margin: 0 }}>
                Dashboard
            </Typography.Title>
            <Typography.Text type="secondary">
                This is a protected route inside the admin layout.
            </Typography.Text>
            <Button onClick={ping}>Test API ping</Button>
        </Flex>
    );
}
