import {
    Button,
    Card,
    Form,
    InputNumber,
    Popconfirm,
    Select,
    Skeleton,
    Space,
    Switch,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import {
    DiscountAPI,
    DiscountConfig,
    DiscountTier,
    DiscountType,
} from "../../../api/discount";

const { Text } = Typography;

const moneyFmt = (n: number) => `${n.toLocaleString("ru-RU").replace(/,/g, " ")} UZS`;

function describeTier(t: DiscountTier): string {
    const max = t.maxFare == null ? "∞" : moneyFmt(t.maxFare);
    const range = `${moneyFmt(t.minFare)} – ${max}`;
    const cut =
        t.type === "percentage"
            ? `−${t.value}%`
            : `−${moneyFmt(t.value)}`;
    return `${range}  →  ${cut}`;
}

type TierFormValues = {
    minFare: number;
    maxFare: number | null;
    type: DiscountType;
    value: number;
};

export default function DiscountSettingsTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<DiscountConfig>({ enabled: false, tiers: [] });
    const [tierForm] = Form.useForm<TierFormValues>();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const sortedTiers = useMemo(
        () => [...config.tiers].sort((a, b) => a.minFare - b.minFare),
        [config.tiers]
    );

    const load = async () => {
        setLoading(true);
        try {
            const data = await DiscountAPI.get();
            setConfig(data);
        } catch {
            message.error("Chegirma sozlamalarini yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const persist = async (next: DiscountConfig) => {
        setSaving(true);
        try {
            const saved = await DiscountAPI.update(next);
            setConfig(saved);
            message.success("Chegirma sozlamalari saqlandi");
        } catch {
            message.error("Saqlashda xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    };

    const onToggleEnabled = (enabled: boolean) => {
        persist({ ...config, enabled });
    };

    const onSubmitTier = (values: TierFormValues) => {
        const tier: DiscountTier = {
            minFare: values.minFare,
            maxFare: values.maxFare == null || Number.isNaN(values.maxFare) ? null : values.maxFare,
            type: values.type,
            value: values.value,
        };

        if (tier.maxFare != null && tier.maxFare <= tier.minFare) {
            message.error("Maksimal narx minimaldan katta bo'lishi kerak");
            return;
        }
        if (tier.type === "percentage" && tier.value > 100) {
            message.error("Foiz 100 dan oshmasligi kerak");
            return;
        }

        const tiers = [...config.tiers];
        if (editingIndex != null) {
            tiers[editingIndex] = tier;
        } else {
            tiers.push(tier);
        }
        persist({ ...config, tiers });
        tierForm.resetFields();
        setEditingIndex(null);
    };

    const onEdit = (index: number) => {
        const t = sortedTiers[index];
        const originalIndex = config.tiers.indexOf(t);
        setEditingIndex(originalIndex);
        tierForm.setFieldsValue({
            minFare: t.minFare,
            maxFare: t.maxFare,
            type: t.type,
            value: t.value,
        });
    };

    const onCancelEdit = () => {
        setEditingIndex(null);
        tierForm.resetFields();
    };

    const onDelete = (index: number) => {
        const t = sortedTiers[index];
        const tiers = config.tiers.filter((x) => x !== t);
        persist({ ...config, tiers });
    };

    return (
        <div style={{ maxWidth: 760 }}>
            <Card
                title="Chegirma tizimi"
                style={{ marginBottom: 24 }}
                extra={
                    <Space>
                        <Text type="secondary">{config.enabled ? "Yoqilgan" : "O'chirilgan"}</Text>
                        <Switch
                            checked={config.enabled}
                            loading={saving}
                            onChange={onToggleEnabled}
                        />
                    </Space>
                }
            >
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Taximeter narxiga avtomatik qo'llaniladigan chegirma. Asl narx
                    chizib ko'rsatiladi, chegirmali narx esa pastda chiqadi. Chegirma
                    bosqichlari quyida sozlanadi: har bosqich uchun narx oralig'i va
                    chegirma turi (foiz yoki belgilangan miqdor) ko'rsatiladi.
                </Text>

                {loading ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                ) : (
                    <Table<DiscountTier>
                        rowKey={(_, i) => String(i)}
                        dataSource={sortedTiers}
                        pagination={false}
                        size="small"
                        locale={{ emptyText: "Bosqichlar yo'q" }}
                        columns={[
                            {
                                title: "Bosqich",
                                key: "range",
                                render: (_, t) => <Text>{describeTier(t)}</Text>,
                            },
                            {
                                title: "Turi",
                                key: "type",
                                width: 110,
                                render: (_, t) => (
                                    <Tag color={t.type === "percentage" ? "blue" : "green"}>
                                        {t.type === "percentage" ? "Foiz" : "Belgilangan"}
                                    </Tag>
                                ),
                            },
                            {
                                title: "",
                                key: "actions",
                                width: 140,
                                render: (_, _t, index) => (
                                    <Space>
                                        <Button size="small" onClick={() => onEdit(index)}>
                                            Tahrirlash
                                        </Button>
                                        <Popconfirm
                                            title="Bosqichni o'chirish?"
                                            okText="Ha"
                                            cancelText="Bekor"
                                            onConfirm={() => onDelete(index)}
                                        >
                                            <Button size="small" danger>
                                                O'chirish
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                ),
                            },
                        ]}
                    />
                )}
            </Card>

            <Card title={editingIndex != null ? "Bosqichni tahrirlash" : "Yangi bosqich qo'shish"}>
                <Form
                    form={tierForm}
                    layout="vertical"
                    onFinish={onSubmitTier}
                    initialValues={{ type: "fixed", minFare: 0 }}
                >
                    <Space.Compact block style={{ display: "flex", gap: 12 }}>
                        <Form.Item
                            name="minFare"
                            label="Minimal narx (UZS)"
                            rules={[{ required: true, type: "number", min: 0 }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                step={1000}
                                min={0}
                                addonAfter="UZS"
                                placeholder="0"
                            />
                        </Form.Item>
                        <Form.Item
                            name="maxFare"
                            label="Maksimal narx (UZS, bo'sh = ∞)"
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                step={1000}
                                min={0}
                                addonAfter="UZS"
                                placeholder="12000"
                            />
                        </Form.Item>
                    </Space.Compact>

                    <Space.Compact block style={{ display: "flex", gap: 12 }}>
                        <Form.Item
                            name="type"
                            label="Chegirma turi"
                            rules={[{ required: true }]}
                            style={{ flex: 1 }}
                        >
                            <Select
                                options={[
                                    { label: "Belgilangan miqdor (UZS)", value: "fixed" },
                                    { label: "Foiz (%)", value: "percentage" },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="value"
                            label="Qiymati"
                            rules={[{ required: true, type: "number", min: 0 }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                step={500}
                                min={0}
                                placeholder="3000"
                            />
                        </Form.Item>
                    </Space.Compact>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={saving}>
                                {editingIndex != null ? "Saqlash" : "Qo'shish"}
                            </Button>
                            {editingIndex != null && (
                                <Button onClick={onCancelEdit}>Bekor qilish</Button>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
