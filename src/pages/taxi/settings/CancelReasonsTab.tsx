import {
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
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
    type CancelReason,
    CancelReasonsAPI,
    type UpdateCancelReason,
} from "../../../api/cancel-reasons";

const { Text } = Typography;

type CreateFormValues = {
    key: string;
    labelUz: string;
    order: number;
};

type EditFormValues = {
    labelUz: string;
    order: number;
    active: boolean;
};

export default function CancelReasonsTab() {
    const [loading, setLoading] = useState(true);
    const [reasons, setReasons] = useState<CancelReason[]>([]);

    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<CancelReason | null>(null);
    const [busy, setBusy] = useState(false);

    const [createForm] = Form.useForm<CreateFormValues>();
    const [editForm] = Form.useForm<EditFormValues>();

    const totalCancellations = useMemo(
        () => reasons.reduce((sum, r) => sum + (r.count ?? 0), 0),
        [reasons]
    );

    const load = async () => {
        setLoading(true);
        try {
            setReasons(await CancelReasonsAPI.list());
        } catch {
            message.error("Sabablarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onCreate = async (values: CreateFormValues) => {
        setBusy(true);
        try {
            await CancelReasonsAPI.create({
                key: values.key.trim(),
                labelUz: values.labelUz.trim(),
                order: values.order ?? 0,
                active: true,
            });
            message.success("Sabab qo'shildi");
            setCreateOpen(false);
            createForm.resetFields();
            await load();
        } catch (err: any) {
            const msg = err?.response?.data?.error ?? "Saqlashda xatolik yuz berdi";
            message.error(msg);
        } finally {
            setBusy(false);
        }
    };

    const patch = async (reason: CancelReason, body: UpdateCancelReason) => {
        try {
            const next = await CancelReasonsAPI.update(reason._id, body);
            setReasons((prev) => prev.map((r) => (r._id === next._id ? next : r)));
        } catch {
            message.error("Yangilashda xatolik");
        }
    };

    const onEditSubmit = async (values: EditFormValues) => {
        if (!editing) return;
        setBusy(true);
        try {
            await patch(editing, {
                labelUz: values.labelUz.trim(),
                order: values.order ?? 0,
                active: values.active,
            });
            message.success("Saqlandi");
            setEditing(null);
            editForm.resetFields();
        } finally {
            setBusy(false);
        }
    };

    const onDelete = async (id: string) => {
        try {
            await CancelReasonsAPI.remove(id);
            setReasons((prev) => prev.filter((r) => r._id !== id));
            message.success("O'chirildi");
        } catch {
            message.error("O'chirishda xatolik");
        }
    };

    const onResetCount = async (reason: CancelReason) => {
        try {
            const next = await CancelReasonsAPI.resetCount(reason._id);
            setReasons((prev) => prev.map((r) => (r._id === next._id ? next : r)));
            message.success("Hisoblagich nolga tushirildi");
        } catch {
            message.error("Tiklashda xatolik");
        }
    };

    return (
        <div style={{ maxWidth: 880 }}>
            <Card
                title="Bekor qilish sabablari"
                style={{ marginBottom: 16 }}
                extra={
                    <Space>
                        <Text type="secondary">
                            Jami bekor qilishlar: <b>{totalCancellations}</b>
                        </Text>
                        <Button type="primary" onClick={() => setCreateOpen(true)}>
                            Yangi sabab
                        </Button>
                    </Space>
                }
            >
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Yo'lovchi haydovchi qabul qilganidan keyin buyurtmani bekor qilsa,
                    quyidagi sabablardan birini tanlaydi. Har bir tanlash mos sabab
                    hisoblagichini bittaga oshiradi — statistikani shu yerdan kuzatish
                    mumkin.
                </Text>

                {loading ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                ) : (
                    <Table<CancelReason>
                        rowKey="_id"
                        dataSource={reasons}
                        pagination={false}
                        size="small"
                        locale={{ emptyText: "Sabablar yo'q" }}
                        columns={[
                            {
                                title: "Tartib",
                                dataIndex: "order",
                                width: 80,
                                sorter: (a, b) => a.order - b.order,
                                render: (_, r) => <Text>{r.order}</Text>,
                            },
                            {
                                title: "Kalit",
                                dataIndex: "key",
                                width: 160,
                                render: (_, r) => <code>{r.key}</code>,
                            },
                            {
                                title: "Matn (UZ)",
                                dataIndex: "labelUz",
                                render: (_, r) => <Text>{r.labelUz}</Text>,
                            },
                            {
                                title: "Tanlanganlar",
                                dataIndex: "count",
                                width: 140,
                                sorter: (a, b) => a.count - b.count,
                                render: (_, r) => (
                                    <Tag color={r.count > 0 ? "blue" : "default"}>{r.count}</Tag>
                                ),
                            },
                            {
                                title: "Faol",
                                dataIndex: "active",
                                width: 100,
                                render: (_, r) => (
                                    <Switch
                                        checked={r.active}
                                        onChange={(active) => patch(r, { active })}
                                    />
                                ),
                            },
                            {
                                title: "",
                                key: "actions",
                                width: 260,
                                render: (_, r) => (
                                    <Space>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setEditing(r);
                                                editForm.setFieldsValue({
                                                    labelUz: r.labelUz,
                                                    order: r.order,
                                                    active: r.active,
                                                });
                                            }}
                                        >
                                            Tahrirlash
                                        </Button>
                                        <Popconfirm
                                            title="Hisoblagichni 0 ga tushirilsinmi?"
                                            okText="Ha"
                                            cancelText="Bekor"
                                            onConfirm={() => onResetCount(r)}
                                        >
                                            <Button size="small">Tiklash</Button>
                                        </Popconfirm>
                                        <Popconfirm
                                            title="Sabab o'chirilsinmi?"
                                            okText="Ha"
                                            cancelText="Bekor"
                                            onConfirm={() => onDelete(r._id)}
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

            <Modal
                title="Yangi sabab"
                open={createOpen}
                onCancel={() => {
                    setCreateOpen(false);
                    createForm.resetFields();
                }}
                onOk={() => createForm.submit()}
                okText="Qo'shish"
                cancelText="Bekor"
                confirmLoading={busy}
                destroyOnClose
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={onCreate}
                    initialValues={{ order: reasons.length }}
                >
                    <Form.Item
                        name="key"
                        label="Kalit (lotin harflar, _ ishlatish mumkin)"
                        rules={[
                            { required: true, message: "Kalit kerak" },
                            {
                                pattern: /^[a-z][a-z0-9_]*$/,
                                message: "Faqat kichik harflar va _ belgilari",
                            },
                        ]}
                    >
                        <Input placeholder="masalan: long_wait" />
                    </Form.Item>
                    <Form.Item
                        name="labelUz"
                        label="Matn (UZ)"
                        rules={[{ required: true, message: "Matn kerak" }]}
                    >
                        <Input placeholder="Foydalanuvchiga ko'rinadigan matn" />
                    </Form.Item>
                    <Form.Item name="order" label="Tartib (raqami kichik bo'lganlar yuqorida)">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={editing ? `Tahrirlash: ${editing.key}` : ""}
                open={!!editing}
                onCancel={() => {
                    setEditing(null);
                    editForm.resetFields();
                }}
                onOk={() => editForm.submit()}
                okText="Saqlash"
                cancelText="Bekor"
                confirmLoading={busy}
                destroyOnClose
            >
                <Form form={editForm} layout="vertical" onFinish={onEditSubmit}>
                    <Form.Item
                        name="labelUz"
                        label="Matn (UZ)"
                        rules={[{ required: true, message: "Matn kerak" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="order" label="Tartib">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="active" label="Faol" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
