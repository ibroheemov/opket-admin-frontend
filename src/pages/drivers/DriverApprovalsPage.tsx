import { useEffect, useState } from "react";
import {
    Badge,
    Button,
    Card,
    Col,
    Flex,
    Image,
    Input,
    Row,
    Space,
    Tag,
    Typography,
    message,
} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { type Driver, DriverAPI } from "../../api/endpoints";

function DocImage({ label, url }: { label: string; url?: string }) {
    if (!url) {
        return (
            <Flex vertical gap={4} align="center">
                <div
                    style={{
                        width: 160,
                        height: 110,
                        background: "#f5f5f5",
                        border: "1px dashed #d9d9d9",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#bbb",
                        fontSize: 12,
                    }}
                >
                    Yuklanmagan
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {label}
                </Typography.Text>
            </Flex>
        );
    }

    return (
        <Flex vertical gap={4} align="center">
            <Image
                width={160}
                height={110}
                src={url}
                style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #f0f0f0" }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {label}
            </Typography.Text>
        </Flex>
    );
}

function DriverApprovalCard({
    driver,
    onApproved,
    onRejected,
}: {
    driver: Driver;
    onApproved: (id: string) => void;
    onRejected: (id: string) => void;
}) {
    const [approveLoading, setApproveLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [comment, setComment] = useState("");
    const [showReject, setShowReject] = useState(false);

    const approve = async () => {
        setApproveLoading(true);
        try {
            await DriverAPI.approveDocuments(driver._id);
            message.success(`${driver.name} hujjatlari tasdiqlandi`);
            onApproved(driver._id);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Tasdiqlashda xatolik");
        } finally {
            setApproveLoading(false);
        }
    };

    const reject = async () => {
        setRejectLoading(true);
        try {
            await DriverAPI.rejectDocuments(driver._id, comment);
            message.success(`${driver.name} hujjatlari rad etildi`);
            onRejected(driver._id);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Rad etishda xatolik");
        } finally {
            setRejectLoading(false);
        }
    };

    const frontUrl = driver.license_front?.url;
    const backUrl = driver.license_back?.url;
    const photoUrl = driver.driver_photo?.url ?? driver.selfie?.url;

    return (
        <Card
            style={{ marginBottom: 16 }}
            title={
                <Flex justify="space-between" align="center">
                    <Space>
                        <Typography.Text strong style={{ fontSize: 16 }}>
                            {driver.name}
                        </Typography.Text>
                        <Tag color="orange">Kutilmoqda</Tag>
                    </Space>
                    <Typography.Text type="secondary">{driver.phone}</Typography.Text>
                </Flex>
            }
            extra={
                <Space>
                    <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => setShowReject((v) => !v)}
                    >
                        Rad etish
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={approveLoading}
                        onClick={approve}
                    >
                        Tasdiqlash
                    </Button>
                </Space>
            }
        >
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Flex vertical gap={4}>
                        <Typography.Text type="secondary">Mashina</Typography.Text>
                        <Typography.Text>{driver.vehicle || `${driver.carModel} ${driver.carColor}`}</Typography.Text>
                    </Flex>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Flex vertical gap={4}>
                        <Typography.Text type="secondary">Raqam</Typography.Text>
                        <Typography.Text>{driver.carNumber} ({driver.regionCode})</Typography.Text>
                    </Flex>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Flex vertical gap={4}>
                        <Typography.Text type="secondary">Ro'yxatdan o'tgan</Typography.Text>
                        <Typography.Text>
                            {driver.createdAt ? new Date(driver.createdAt).toLocaleDateString("uz-UZ") : "—"}
                        </Typography.Text>
                    </Flex>
                </Col>
            </Row>

            <Typography.Title level={5} style={{ marginTop: 16, marginBottom: 12 }}>
                Hujjatlar
            </Typography.Title>
            <Flex gap={24} wrap="wrap">
                <DocImage label="Tex passport (old tomoni)" url={frontUrl} />
                <DocImage label="Tex passport (orqa tomoni)" url={backUrl} />
                <DocImage label="Haydovchilik guvohnoma rasmi" url={photoUrl} />
            </Flex>

            {showReject && (
                <Flex vertical gap={8} style={{ marginTop: 16 }}>
                    <Input.TextArea
                        rows={3}
                        placeholder="Rad etish sababini kiriting (ixtiyoriy)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <Flex gap={8} justify="flex-end">
                        <Button onClick={() => { setShowReject(false); setComment(""); }}>
                            Bekor qilish
                        </Button>
                        <Button
                            danger
                            type="primary"
                            icon={<CloseCircleOutlined />}
                            loading={rejectLoading}
                            onClick={reject}
                        >
                            Rad etishni tasdiqlash
                        </Button>
                    </Flex>
                </Flex>
            )}
        </Card>
    );
}

export default function DriverApprovalsPage() {
    const [loading, setLoading] = useState(false);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [total, setTotal] = useState(0);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await DriverAPI.list({
                documentsApproved: "false",
                documentsRejected: "false",
                pageSize: 100,
                sortBy: "createdAt",
                sortOrder: "desc",
            });
            setDrivers(res.drivers);
            setTotal(res.meta.total);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApproved = (id: string) => {
        setDrivers((prev) => prev.filter((d) => d._id !== id));
        setTotal((prev) => prev - 1);
    };

    const handleRejected = (id: string) => {
        setDrivers((prev) => prev.filter((d) => d._id !== id));
        setTotal((prev) => prev - 1);
    };

    return (
        <Flex vertical gap="middle" style={{ width: "100%" }}>
            <Flex justify="space-between" align="center">
                <Space align="center">
                    <Typography.Title level={2} style={{ margin: 0 }}>
                        Hujjat tasdiqlash
                    </Typography.Title>
                    {total > 0 && (
                        <Badge count={total} style={{ backgroundColor: "#faad14" }} />
                    )}
                </Space>
                <Button icon={<ReloadOutlined />} loading={loading} onClick={fetchPending}>
                    Yangilash
                </Button>
            </Flex>

            {!loading && drivers.length === 0 && (
                <Flex
                    justify="center"
                    align="center"
                    style={{ minHeight: 200 }}
                >
                    <Typography.Text type="secondary">
                        Tasdiqlanmagan hujjat yo'q
                    </Typography.Text>
                </Flex>
            )}

            {drivers.map((driver) => (
                <DriverApprovalCard
                    key={driver._id}
                    driver={driver}
                    onApproved={handleApproved}
                    onRejected={handleRejected}
                />
            ))}
        </Flex>
    );
}
