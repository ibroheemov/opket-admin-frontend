import { useEffect, useState, useCallback } from "react";
import { Card, Col, Flex, Row, Spin, Statistic, Tag, Typography, message } from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SendOutlined,
    CarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    ThunderboltOutlined,
    RocketOutlined,
} from "@ant-design/icons";
import { RideAPI, OnlineDriversAPI } from "../../api/endpoints";

type Stats = {
    totalRides: number;
    completed: number;
    cancelled: number;
    offered: number;
    pending: number;
    accepted: number;
    started: number;
    arrived: number;
    totalRevenue: number;
    onlineDrivers: number;
};

const EMPTY: Stats = {
    totalRides: 0,
    completed: 0,
    cancelled: 0,
    offered: 0,
    pending: 0,
    accepted: 0,
    started: 0,
    arrived: 0,
    totalRevenue: 0,
    onlineDrivers: 0,
};

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>(EMPTY);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const [completedRes, cancelledRes, offeredRes, pendingRes, acceptedRes, startedRes, arrivedRes, driversRes] =
                await Promise.allSettled([
                    RideAPI.list({ page: 1, pageSize: 1, status: "completed" }),
                    RideAPI.list({ page: 1, pageSize: 1, status: "cancelled" }),
                    RideAPI.list({ page: 1, pageSize: 1, status: "offered" }),
                    RideAPI.list({ page: 1, pageSize: 1, status: "pending" }),
                    RideAPI.list({ page: 1, pageSize: 1, status: "accepted" }),
                    RideAPI.list({ page: 1, pageSize: 1, status: "started" }),
                    RideAPI.list({ page: 1, pageSize: 1, status: "arrived" }),
                    OnlineDriversAPI.list(),
                ]);

            const completedTotal = completedRes.status === "fulfilled" ? completedRes.value.meta.total : 0;
            const cancelledTotal = cancelledRes.status === "fulfilled" ? cancelledRes.value.meta.total : 0;
            const offeredTotal = offeredRes.status === "fulfilled" ? offeredRes.value.meta.total : 0;
            const pendingTotal = pendingRes.status === "fulfilled" ? pendingRes.value.meta.total : 0;
            const acceptedTotal = acceptedRes.status === "fulfilled" ? acceptedRes.value.meta.total : 0;
            const startedTotal = startedRes.status === "fulfilled" ? startedRes.value.meta.total : 0;
            const arrivedTotal = arrivedRes.status === "fulfilled" ? arrivedRes.value.meta.total : 0;
            const onlineDrivers = driversRes.status === "fulfilled" ? driversRes.value.count : 0;

            let totalRevenue = 0;
            if (completedRes.status === "fulfilled" && completedTotal > 0) {
                const allPages = Math.ceil(completedTotal / 100);
                const revenuePromises = Array.from({ length: Math.min(allPages, 50) }, (_, i) =>
                    RideAPI.list({ page: i + 1, pageSize: 100, status: "completed" })
                );
                const pages = await Promise.allSettled(revenuePromises);
                for (const p of pages) {
                    if (p.status === "fulfilled") {
                        totalRevenue += p.value.rides.reduce((sum, r) => sum + (r.fare ?? 0), 0);
                    }
                }
            }

            setStats({
                totalRides: completedTotal + cancelledTotal + offeredTotal + pendingTotal + acceptedTotal + startedTotal + arrivedTotal,
                completed: completedTotal,
                cancelled: cancelledTotal,
                offered: offeredTotal,
                pending: pendingTotal,
                accepted: acceptedTotal,
                started: startedTotal,
                arrived: arrivedTotal,
                totalRevenue,
                onlineDrivers,
            });
        } catch {
            message.error("Statistikani yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return (
            <Flex justify="center" align="center" style={{ height: 300 }}>
                <Spin size="large">
                    <div style={{ padding: 40 }}>Yuklanmoqda...</div>
                </Spin>
            </Flex>
        );
    }

    return (
        <Flex vertical gap="large" style={{ width: "100%" }}>
            <Flex justify="space-between" align="center">
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Bosh sahifa
                </Typography.Title>
                <Tag color="blue" style={{ fontSize: 13, padding: "2px 10px" }}>
                    Jami buyurtmalar: {stats.totalRides}
                </Tag>
            </Flex>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Umumiy daromad"
                            value={stats.totalRevenue}
                            precision={0}
                            suffix="so'm"
                            prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Bajarilgan"
                            value={stats.completed}
                            prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Bekor qilingan"
                            value={stats.cancelled}
                            prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Online haydovchilar"
                            value={stats.onlineDrivers}
                            prefix={<CarOutlined style={{ color: "#1677ff" }} />}
                            valueStyle={{ color: "#1677ff" }}
                        />
                    </Card>
                </Col>
            </Row>

            <Typography.Title level={4} style={{ margin: 0 }}>
                Buyurtma holatlari
            </Typography.Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Kutilmoqda"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined style={{ color: "#8c8c8c" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Taklif qilingan"
                            value={stats.offered}
                            prefix={<SendOutlined style={{ color: "#1677ff" }} />}
                            valueStyle={{ color: "#1677ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Qabul qilingan"
                            value={stats.accepted}
                            prefix={<ThunderboltOutlined style={{ color: "#13c2c2" }} />}
                            valueStyle={{ color: "#13c2c2" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Yetib kelgan"
                            value={stats.arrived}
                            prefix={<RocketOutlined style={{ color: "#722ed1" }} />}
                            valueStyle={{ color: "#722ed1" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Yo'lda"
                            value={stats.started}
                            prefix={<CarOutlined style={{ color: "#faad14" }} />}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Card>
                </Col>
            </Row>
        </Flex>
    );
}
