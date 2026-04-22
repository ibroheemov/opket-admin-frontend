import {
    Button,
    Form,
    InputNumber,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { FaresAPI, type Fare, type FarePayload, type FareType } from "../../../api/fares";

type FormValues = FarePayload;

const TYPE_LABEL: Record<FareType, string> = {
    standard: "Standard",
    comfort: "Comfort",
    ghost: "Ghost",
};

const TYPE_COLOR: Record<FareType, string> = {
    standard: "blue",
    comfort: "geekblue",
    ghost: "purple",
};

const TYPE_OPTIONS: { value: FareType; label: string }[] = [
    { value: "standard", label: "Standard" },
    { value: "comfort", label: "Comfort" },
    { value: "ghost", label: "Ghost" },
];

const DEFAULTS: FarePayload = {
    type: "standard",
    baseFare: 0,
    perKm: 0,
    firstKm: 0,
    outsidePerKm: 0,
    outsideFirstKm: 0,
    perMinute: 0,
    minutesBeforeCharge: 0,
    smallestDistance: 0,
    smallestDistanceFare: 0,
};

export default function FareSettingsTab() {
    const [data, setData] = useState<Fare[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Fare | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<FormValues>();

    const load = async () => {
        setLoading(true);
        try {
            const list = await FaresAPI.list();
            setData(list);
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            message.error(err?.response?.data?.message ?? "Tariflarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const columns: ColumnsType<Fare> = [
        {
            title: "Turi",
            dataIndex: "type",
            width: 120,
            render: (v: FareType) => <Tag color={TYPE_COLOR[v] ?? "default"}>{TYPE_LABEL[v] ?? v}</Tag>,
        },
        { title: "Boshlang‘ich narx", dataIndex: "baseFare", width: 140 },
        { title: "Birinchi km", dataIndex: "firstKm", width: 120 },
        { title: "Har km", dataIndex: "perKm", width: 120 },
        { title: "Shahar tashqarisi birinchi km", dataIndex: "outsideFirstKm", width: 180 },
        { title: "Shahar tashqarisi har km", dataIndex: "outsidePerKm", width: 180 },
        { title: "Har daqiqa", dataIndex: "perMinute", width: 120 },
        { title: "Kutish (daq.)", dataIndex: "minutesBeforeCharge", width: 130 },
        { title: "Eng qisqa masofa (km)", dataIndex: "smallestDistance", width: 170 },
        { title: "Eng qisqa masofa narxi", dataIndex: "smallestDistanceFare", width: 170 },
        {
            title: "",
            fixed: "right",
            width: 200,
            render: (_, row) => (
                <Space>
                    <Button type="link" onClick={() => openEdit(row)}>
                        Tahrirlash
                    </Button>
                    <Popconfirm
                        title="Tarifni o‘chirasizmi?"
                        okText="O‘chirish"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                            try {
                                await FaresAPI.remove(row._id);
                                message.success("O‘chirildi");
                                load();
                            } catch (e: unknown) {
                                const err = e as { response?: { data?: { message?: string } } };
                                message.error(err?.response?.data?.message ?? "O‘chirish muvaffaqiyatsiz");
                            }
                        }}
                    >
                        <Button type="link" danger>
                            O‘chirish
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const openEdit = (row: Fare) => {
        setEditing(row);
        form.setFieldsValue({
            type: row.type,
            baseFare: row.baseFare,
            perKm: row.perKm,
            firstKm: row.firstKm,
            outsidePerKm: row.outsidePerKm,
            outsideFirstKm: row.outsideFirstKm,
            perMinute: row.perMinute,
            minutesBeforeCharge: row.minutesBeforeCharge,
            smallestDistance: row.smallestDistance,
            smallestDistanceFare: row.smallestDistanceFare,
        });
        setOpen(true);
    };

    const submit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const payload: FarePayload = {
                type: values.type,
                baseFare: Number(values.baseFare),
                perKm: Number(values.perKm),
                firstKm: Number(values.firstKm),
                outsidePerKm: Number(values.outsidePerKm),
                outsideFirstKm: Number(values.outsideFirstKm),
                perMinute: Number(values.perMinute),
                minutesBeforeCharge: Number(values.minutesBeforeCharge),
                smallestDistance: Number(values.smallestDistance),
                smallestDistanceFare: Number(values.smallestDistanceFare),
            };
            if (editing) {
                await FaresAPI.update(editing._id, payload);
                message.success("Yangilandi");
            } else {
                await FaresAPI.create(payload);
                message.success("Yaratildi");
            }
            setOpen(false);
            setEditing(null);
            form.resetFields();
            load();
        } catch (e: unknown) {
            const err = e as { errorFields?: unknown; response?: { data?: { message?: string } } };
            if (err?.errorFields) return;
            message.error(err?.response?.data?.message ?? "Saqlash muvaffaqiyatsiz");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Space style={{ marginBottom: 12 }}>
                <Button
                    type="primary"
                    onClick={() => {
                        setEditing(null);
                        form.resetFields();
                        form.setFieldsValue(DEFAULTS);
                        setOpen(true);
                    }}
                >
                    Tarif qo‘shish
                </Button>
                <Button onClick={load} loading={loading}>
                    Yangilash
                </Button>
            </Space>

            <Table<Fare>
                rowKey="_id"
                loading={loading}
                dataSource={data}
                columns={columns}
                pagination={false}
                scroll={{ x: 1500 }}
            />

            <Modal
                title={editing ? "Tarifni tahrirlash" : "Tarif qo‘shish"}
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setEditing(null);
                    form.resetFields();
                }}
                onOk={submit}
                confirmLoading={saving}
                destroyOnHidden
                width={640}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }} initialValues={DEFAULTS}>
                    <Form.Item
                        name="type"
                        label="Sayohat turi"
                        rules={[{ required: true, message: "Turi tanlang" }]}
                    >
                        <Select options={TYPE_OPTIONS} placeholder="Turi tanlang" />
                    </Form.Item>

                    <Space style={{ display: "flex" }} size="middle" align="start" wrap>
                        <Form.Item
                            name="baseFare"
                            label="Boshlang‘ich narx"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0} style={{ width: 180 }} />
                        </Form.Item>
                        <Form.Item
                            name="firstKm"
                            label="Birinchi km narxi"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0} style={{ width: 180 }} />
                        </Form.Item>
                        <Form.Item
                            name="perKm"
                            label="Har km narxi"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0} style={{ width: 180 }} />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: "flex" }} size="middle" align="start" wrap>
                        <Form.Item
                            name="outsideFirstKm"
                            label="Shahar tashqarisi birinchi km"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0} style={{ width: 220 }} />
                        </Form.Item>
                        <Form.Item
                            name="outsidePerKm"
                            label="Shahar tashqarisi har km"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0} style={{ width: 220 }} />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: "flex" }} size="middle" align="start" wrap>
                        <Form.Item
                            name="perMinute"
                            label="Har daqiqa narxi"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0} style={{ width: 180 }} />
                        </Form.Item>
                        <Form.Item
                            name="minutesBeforeCharge"
                            label="Kutish boshlanishi (daq.)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0} step={0.1} style={{ width: 200 }} />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: "flex" }} size="middle" align="start" wrap>
                        <Form.Item
                            name="smallestDistance"
                            label="Eng qisqa masofa (km)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0} step={0.1} style={{ width: 200 }} />
                        </Form.Item>
                        <Form.Item
                            name="smallestDistanceFare"
                            label="Eng qisqa masofa narxi"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0} style={{ width: 200 }} />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
        </>
    );
}
