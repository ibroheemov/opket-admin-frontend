import { Typography, Flex, Button } from "antd";
import { HealthAPI } from "../../api/endpoints";

export default function Dashboard() {
    const ping = async () => {
        try {
            const res = await HealthAPI.ping();
            alert(JSON.stringify(res));
        } catch {
            alert("API bilan bog'lanishda xatolik yuz berdi.");
        }
    };

    return (
        <Flex vertical gap="middle" style={{ width: "100%" }}>
            <Typography.Title level={2} style={{ margin: 0 }}>
                Bosh sahifa
            </Typography.Title>
            <Typography.Text type="secondary">
                Bu admin panelning himoyalangan sahifasi.
            </Typography.Text>
            <Button onClick={ping}>API tekshirish</Button>
        </Flex>
    );
}
