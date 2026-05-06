import { useEffect, useState } from "react";
import { Card, Skeleton, Tooltip } from "antd";
import {
    ShoppingOutlined,
    DollarOutlined,
    LineChartOutlined,
    SyncOutlined,
    QrcodeOutlined,
    CarOutlined,
} from "@ant-design/icons";
import { StatsAPI, type OrderStats, type ServiceType } from "../api/stats";

const fmtSum = (v: number) => (v || 0).toLocaleString("uz-UZ");

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    accent?: string;
}

function StatItem({ icon, label, value, sub, accent = "#FACC15" }: StatItemProps) {
    return (
        <Card
            size="small"
            style={{
                flex: 1,
                minWidth: 180,
                borderRadius: 16,
                border: "1px solid #e4e4e7",
            }}
            styles={{ body: { padding: 14 } }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: accent + "22",
                        color: "#3f3f46",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                    }}
                >
                    {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}>
                        {label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1, marginTop: 2 }}>
                        {value}
                    </div>
                    {sub && (
                        <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 2 }}>{sub}</div>
                    )}
                </div>
            </div>
        </Card>
    );
}

export function StatsRow({ serviceType }: { serviceType: ServiceType }) {
    const [data, setData] = useState<OrderStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        StatsAPI.orders(serviceType)
            .then((r) => { if (mounted) setData(r.data?.data ?? null); })
            .catch(() => { /* show zeros */ })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [serviceType]);

    const isDineIn = serviceType === "DINE_IN";
    const accent = isDineIn ? "#FACC15" : "#34D399";

    if (loading && !data) {
        return (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card
                        key={i}
                        size="small"
                        style={{ flex: 1, minWidth: 180, borderRadius: 16 }}
                        styles={{ body: { padding: 14 } }}
                    >
                        <Skeleton paragraph={{ rows: 1 }} active title={false} />
                    </Card>
                ))}
            </div>
        );
    }

    const d = data || {
        today: { count: 0, revenue: 0 },
        week: { count: 0, revenue: 0 },
        month: { count: 0, revenue: 0 },
        active: { count: 0 },
        total: { count: 0, revenue: 0 },
        avgOrderValueToday: 0,
    } as Partial<OrderStats> as OrderStats;

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <StatItem
                icon={isDineIn ? <QrcodeOutlined /> : <CarOutlined />}
                label="Bugun"
                value={String(d.today.count)}
                sub={`${fmtSum(d.today.revenue)} so'm`}
                accent={accent}
            />
            <StatItem
                icon={<ShoppingOutlined />}
                label="Bu hafta"
                value={String(d.week.count)}
                sub={`${fmtSum(d.week.revenue)} so'm`}
                accent={accent}
            />
            <StatItem
                icon={<LineChartOutlined />}
                label="Bu oy"
                value={String(d.month.count)}
                sub={`${fmtSum(d.month.revenue)} so'm`}
                accent={accent}
            />
            <Tooltip title="Hozir tayyorlanmoqda yoki kutmoqda">
                <div style={{ flex: 1, minWidth: 180 }}>
                    <StatItem
                        icon={<SyncOutlined spin={d.active.count > 0} />}
                        label="Aktiv"
                        value={String(d.active.count)}
                        sub="Hozircha"
                        accent={accent}
                    />
                </div>
            </Tooltip>
            <StatItem
                icon={<DollarOutlined />}
                label="O'rtacha (bugun)"
                value={`${fmtSum(d.avgOrderValueToday)}`}
                sub="so'm"
                accent={accent}
            />
        </div>
    );
}
