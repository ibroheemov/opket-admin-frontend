import {
    Badge,
    Button,
    message,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import { CheckOutlined, CloseOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { ReferralAPI, type ReferralRecord, type ReferralStatus } from "../../api/referral";

const { Text } = Typography;

const STATUS_LABELS: Record<ReferralStatus, { label: string; color: string }> = {
    pending_location: { label: "Kutilmoqda", color: "orange" },
    approved: { label: "Tasdiqlandi", color: "green" },
    rejected: { label: "Rad etildi", color: "red" },
};

export default function ReferralApprovalsPage() {
    const [records, setRecords] = useState<ReferralRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("pending_location");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 20;

    const load = async (p = page, status = statusFilter) => {
        setLoading(true);
        try {
            const res = await ReferralAPI.listReferrals({ status, page: p, pageSize });
            setRecords(res.records);
            setTotal(res.meta.total);
        } catch {
            message.error("Referral ma'lumotlarini yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(1, statusFilter);
        setPage(1);
    }, [statusFilter]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await ReferralAPI.approveReferral(id);
            message.success("Referral tasdiqlandi va bonus haydovchiga o'tkazildi");
            load();
        } catch {
            message.error("Tasdiqlashda xatolik yuz berdi");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        try {
            await ReferralAPI.rejectReferral(id);
            message.success("Referral rad etildi");
            load();
        } catch {
            message.error("Rad etishda xatolik yuz berdi");
        } finally {
            setActionLoading(null);
        }
    };

    const columns = [
        {
            title: "Taklif qiluvchi (haydovchi)",
            key: "referrer",
            render: (_: any, r: ReferralRecord) =>
                r.referrer ? (
                    <div>
                        <Text strong>
                            {r.referrer.firstname} {r.referrer.lastname}
                        </Text>
                        <br />
                        <Text type="secondary">{r.referrer.phone}</Text>
                    </div>
                ) : (
                    <Text type="secondary">—</Text>
                ),
        },
        {
            title: "Taklif qilingan",
            key: "referred",
            render: (_: any, r: ReferralRecord) => {
                const name =
                    r.referred && r.referredUserType === "driver"
                        ? `${r.referred.firstname ?? ""} ${r.referred.lastname ?? ""}`.trim()
                        : null;
                return r.referred ? (
                    <div>
                        {name && (
                            <>
                                <Text strong>{name}</Text>
                                <br />
                            </>
                        )}
                        <Text type="secondary">{String(r.referred.phone)}</Text>
                    </div>
                ) : (
                    <Text type="secondary">—</Text>
                );
            },
        },
        {
            title: "Turi",
            dataIndex: "referredUserType",
            key: "referredUserType",
            render: (type: string) => (
                <Tag color={type === "driver" ? "blue" : "purple"}>
                    {type === "driver" ? "Haydovchi" : "Yo'lovchi"}
                </Tag>
            ),
        },
        {
            title: "Joylashuv",
            key: "referredLocation",
            render: (_: any, r: ReferralRecord) => {
                if (!r.referredLocation) {
                    return <Text type="secondary">Aniqlanmagan</Text>;
                }
                const { lat, lng } = r.referredLocation;
                const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                return (
                    <Tooltip title={`${lat.toFixed(6)}, ${lng.toFixed(6)}`}>
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                            <Button
                                size="small"
                                icon={<EnvironmentOutlined />}
                                type="link"
                                style={{ padding: 0 }}
                            >
                                Xaritada ko'rish
                            </Button>
                        </a>
                    </Tooltip>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: ReferralStatus) => {
                const s = STATUS_LABELS[status];
                return <Badge color={s.color} text={s.label} />;
            },
        },
        {
            title: "Tekshiruv",
            key: "autoVerified",
            render: (_: any, r: ReferralRecord) => {
                if (r.status === "pending_location") {
                    return <Text type="secondary">—</Text>;
                }
                return r.autoVerified ? (
                    <Tag color="geekblue">Avtomatik (radius)</Tag>
                ) : (
                    <Tag color="gold">Qo'lda</Tag>
                );
            },
        },
        {
            title: "Bonus (UZS)",
            dataIndex: "bonusAmount",
            key: "bonusAmount",
            render: (amount: number) =>
                amount > 0 ? (
                    <Text>{amount.toLocaleString("uz-UZ")}</Text>
                ) : (
                    <Text type="secondary">—</Text>
                ),
        },
        {
            title: "Sana",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => new Date(date).toLocaleDateString("uz-UZ"),
        },
        {
            title: "Amallar",
            key: "actions",
            render: (_: any, r: ReferralRecord) => {
                const approveBtn = (
                    <Popconfirm
                        title={
                            r.status === "rejected"
                                ? "Avtomatik rad etilgan referralni tasdiqlaysizmi?"
                                : "Referralni tasdiqlaysizmi?"
                        }
                        description="Taklif qiluvchi haydovchiga bonus o'tkaziladi."
                        onConfirm={() => handleApprove(r._id)}
                        okText="Ha"
                        cancelText="Yo'q"
                    >
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            loading={actionLoading === r._id}
                        >
                            Tasdiqlash
                        </Button>
                    </Popconfirm>
                );

                const rejectBtn = (
                    <Popconfirm
                        title={
                            r.status === "approved"
                                ? "Tasdiqlangan referralni bekor qilasizmi?"
                                : "Referralni rad etasizmi?"
                        }
                        description={
                            r.bonusCredited
                                ? "Avval o'tkazilgan bonus haydovchidan qaytarib olinadi."
                                : undefined
                        }
                        onConfirm={() => handleReject(r._id)}
                        okText="Ha"
                        cancelText="Yo'q"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            danger
                            size="small"
                            icon={<CloseOutlined />}
                            loading={actionLoading === r._id}
                        >
                            {r.status === "approved" ? "Bekor qilish" : "Rad etish"}
                        </Button>
                    </Popconfirm>
                );

                // Verification is automatic; these buttons are manual overrides.
                if (r.status === "approved") return rejectBtn;
                if (r.status === "rejected") return approveBtn;
                return (
                    <Space>
                        {approveBtn}
                        {rejectBtn}
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <div>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                        Referral so'rovlari
                    </Typography.Title>
                    <Text type="secondary">
                        Referrallar joylashuv kelganda referral radiusiga ko'ra
                        avtomatik tasdiqlanadi yoki rad etiladi. Bu yerdan qo'lda
                        bekor qilish yoki qayta tasdiqlash mumkin.
                    </Text>
                </div>
                <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 180 }}
                    options={[
                        { value: "pending_location", label: "Kutilmoqda" },
                        { value: "approved", label: "Tasdiqlangan" },
                        { value: "rejected", label: "Rad etilgan" },
                    ]}
                />
            </div>

            <Table
                rowKey="_id"
                loading={loading}
                dataSource={records}
                columns={columns}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    onChange: (p) => {
                        setPage(p);
                        load(p);
                    },
                }}
            />
        </div>
    );
}
