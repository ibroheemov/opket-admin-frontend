import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Input, List, Tag, Typography, Space, Empty, Spin, message } from "antd";
import { QrcodeOutlined, SearchOutlined } from "@ant-design/icons";
import { RestaurantsAPI } from "../../../api/restaurants";
import { StatsRow } from "../../../components/StatsRow";

const { Title, Text } = Typography;

interface RestaurantRow {
    _id: string;
    name: string;
    slug?: string;
    address?: { city?: string };
    is_open?: boolean;
}

export default function QrCodesPage() {
    const [items, setItems] = useState<RestaurantRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");

    async function load() {
        setLoading(true);
        try {
            const r = await RestaurantsAPI.list({ pageSize: 100, q, status: "ALL" });
            const body: any = r.data;
            const list: any[] = body?.restaurants ?? body?.data?.items ?? [];
            setItems(list);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Yuklab bo'lmadi");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

    return (
        <div>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                    <QrcodeOutlined /> QR Kodlar
                </Title>
                <Input
                    placeholder="Restoran qidirish..."
                    prefix={<SearchOutlined />}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onPressEnter={load}
                    allowClear
                    style={{ width: 280 }}
                />
            </Space>

            <StatsRow serviceType="DINE_IN" />

            <Card>
                {loading ? (
                    <div style={{ textAlign: "center", padding: 40 }}>
                        <Spin />
                    </div>
                ) : items.length === 0 ? (
                    <Empty description="Restoran topilmadi" />
                ) : (
                    <List
                        dataSource={items}
                        renderItem={(r) => (
                            <List.Item
                                actions={[
                                    <Link key="open" to={`/app/food/qr-codes/${r._id}`}>QR generatsiya qilish</Link>,
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <span>{r.name}</span>
                                            {r.slug && <Tag color="default">/{r.slug}</Tag>}
                                            {r.is_open ? <Tag color="green">Ochiq</Tag> : <Tag>Yopiq</Tag>}
                                        </Space>
                                    }
                                    description={<Text type="secondary">{r.address?.city || "—"}</Text>}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
}
