import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Flex,
    Form,
    InputNumber,
    Modal,
    Space,
    Table,
    Tag,
    Typography,
    Input,
    message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { type Passenger, PassengerAPI } from "../../api/passengers";

export default function PassengersPage() {
    const [loading, setLoading] = useState(false);
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [q, setQ] = useState("");

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Passenger | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<{ balance: number }>();

    const fetchPassengers = async () => {
        setLoading(true);
        try {
            const res = await PassengerAPI.list({ page, pageSize, q: q.trim() || undefined });
            setPassengers(res.passengers);
            setTotal(res.meta.total);
        } catch {
            message.error("Yo'lovchilarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPassengers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const columns: ColumnsType<Passenger> = useMemo(
        () => [
            {
                title: "Telefon",
                dataIndex: "phone",
                width: 160,
                render: (v: number) => <Typography.Text copyable>{String(v)}</Typography.Text>,
            },
            {
                title: "Balans",
                dataIndex: "balance",
                width: 160,
                render: (v: number) => (
                    <Typography.Text strong>
                        {v.toLocaleString("uz-UZ")} UZS
                    </Typography.Text>
                ),
            },
            {
                title: "Ilova versiyasi",
                dataIndex: "appVersion",
                width: 140,
                render: (v?: string) => v ?? "—",
            },
            {
                title: "Bildirishnoma",
                dataIndex: "notificationEnabled",
                width: 140,
                render: (v?: boolean) =>
                    v ? <Tag color="success">Yoqilgan</Tag> : <Tag color="default">O'chirilgan</Tag>,
            },
            {
                title: "Tasdiqlangan",
                dataIndex: "verified",
                width: 130,
                render: (v?: boolean) =>
                    v ? <Tag color="success">Ha</Tag> : <Tag color="default">Yo'q</Tag>,
            },
            {
                title: "Joriy safar",
                dataIndex: "currentRideId",
                width: 130,
                render: (v?: string) =>
                    v ? <Tag color="processing">Faol</Tag> : <Tag>Yo'q</Tag>,
            },
            {
                title: "Ro'yxatdan o'tgan",
                dataIndex: "createdAt",
                width: 180,
                render: (v?: string) => (v ? new Date(v).toLocaleDateString("uz-UZ") : "—"),
            },
            {
                title: "",
                key: "actions",
                width: 110,
                render: (_, p) => (
                    <Button
                        type="link"
                        onClick={() => {
                            setEditing(p);
                            form.setFieldsValue({ balance: p.balance });
                            setOpen(true);
                        }}
                    >
                        Tahrirlash
                    </Button>
                ),
            },
        ],
        [form]
    );

    const pagination: TablePaginationConfig = {
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50"],
        onChange: (p, ps) => {
            setPage(p);
            if (ps && ps !== pageSize) {
                setPageSize(ps);
                setPage(1);
            }
        },
    };

    const save = async () => {
        const values = await form.validateFields();
        if (!editing) return;
        setSaving(true);
        try {
            const updated = await PassengerAPI.update(editing._id, { balance: values.balance });
            message.success("Yo'lovchi yangilandi");
            setPassengers((prev) => prev.map((p) => (p._id === editing._id ? { ...p, ...updated } : p)));
            setOpen(false);
            setEditing(null);
        } catch {
            message.error("Yangilash muvaffaqiyatsiz");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Flex vertical gap="middle" style={{ width: "100%" }}>
            <Typography.Title level={2} style={{ margin: 0 }}>
                Yo'lovchilar
            </Typography.Title>

            <Space wrap>
                <Input.Search
                    allowClear
                    placeholder="Telefon raqami..."
                    style={{ width: 280 }}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onSearch={() => {
                        setPage(1);
                        fetchPassengers();
                    }}
                />
                <Button
                    onClick={() => {
                        setQ("");
                        setPage(1);
                        fetchPassengers();
                    }}
                >
                    Tozalash
                </Button>
                <Button onClick={fetchPassengers} loading={loading}>
                    Yangilash
                </Button>
            </Space>

            <Table<Passenger>
                rowKey="_id"
                loading={loading}
                columns={columns}
                dataSource={passengers}
                pagination={pagination}
            />

            <Modal
                title="Yo'lovchini tahrirlash"
                open={open}
                onCancel={() => { setOpen(false); setEditing(null); }}
                onOk={save}
                okText="Saqlash"
                confirmLoading={saving}
                destroyOnHidden
            >
                <Form layout="vertical" form={form} style={{ marginTop: 16 }}>
                    <Form.Item
                        label="Telefon"
                    >
                        <Typography.Text>{editing?.phone}</Typography.Text>
                    </Form.Item>
                    <Form.Item
                        label="Balans (UZS)"
                        name="balance"
                        rules={[
                            { required: true, message: "Balansni kiriting" },
                            { type: "number", min: 0, message: "0 dan kam bo'lmasligi kerak" },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            step={1000}
                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                            parser={(v) => Number(v?.replace(/\s/g, "") ?? 0) as 0}
                            addonAfter="UZS"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Flex>
    );
}
