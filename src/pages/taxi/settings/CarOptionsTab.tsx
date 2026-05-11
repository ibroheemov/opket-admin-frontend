import {
    Button,
    Form,
    Input,
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
import {
    CarOptionsAPI,
    type CarOption,
    type CarOptionPayload,
    type CarOptionType,
} from "../../../api/car-options";

type FormValues = CarOptionPayload;

const TYPE_LABELS: Record<CarOptionType, string> = {
    car_model: "Avtomobil modeli",
    car_color: "Avtomobil rangi",
};

export default function CarOptionsTab() {
    const [data, setData] = useState<CarOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<CarOption | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<FormValues>();

    const load = async () => {
        setLoading(true);
        try {
            const list = await CarOptionsAPI.list();
            setData(list);
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            message.error(err?.response?.data?.message ?? "Yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const columns: ColumnsType<CarOption> = [
        { title: "Tartib", dataIndex: "sort_order", width: 80 },
        {
            title: "Turi",
            dataIndex: "type",
            width: 180,
            render: (v: CarOptionType) => (
                <Tag color={v === "car_model" ? "blue" : "green"}>
                    {TYPE_LABELS[v]}
                </Tag>
            ),
        },
        { title: "Qiymati", dataIndex: "value" },
        {
            title: "",
            width: 200,
            render: (_, row) => (
                <Space>
                    <Button type="link" onClick={() => openEdit(row)}>
                        Tahrirlash
                    </Button>
                    <Popconfirm
                        title="O'chirasizmi?"
                        okText="O'chirish"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                            try {
                                await CarOptionsAPI.remove(row._id);
                                message.success("O'chirildi");
                                load();
                            } catch (e: unknown) {
                                const err = e as { response?: { data?: { message?: string } } };
                                message.error(err?.response?.data?.message ?? "O'chirish muvaffaqiyatsiz");
                            }
                        }}
                    >
                        <Button type="link" danger>
                            O'chirish
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const openEdit = (row: CarOption) => {
        setEditing(row);
        form.setFieldsValue({
            type: row.type,
            value: row.value,
            sort_order: row.sort_order ?? 0,
        });
        setOpen(true);
    };

    const submit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const payload: CarOptionPayload = {
                type: values.type,
                value: values.value.trim(),
                sort_order: Number(values.sort_order ?? 0),
            };
            if (editing) {
                await CarOptionsAPI.update(editing._id, payload);
                message.success("Yangilandi");
            } else {
                await CarOptionsAPI.create(payload);
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
                        form.setFieldsValue({ sort_order: 0 });
                        setOpen(true);
                    }}
                >
                    Qo'shish
                </Button>
                <Button onClick={load} loading={loading}>
                    Yangilash
                </Button>
            </Space>

            <Table<CarOption>
                rowKey="_id"
                loading={loading}
                dataSource={data}
                columns={columns}
                pagination={false}
            />

            <Modal
                title={editing ? "Tahrirlash" : "Yangi qiymat qo'shish"}
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setEditing(null);
                    form.resetFields();
                }}
                onOk={submit}
                confirmLoading={saving}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="type"
                        label="Turi"
                        rules={[{ required: true, message: "Turini tanlang" }]}
                    >
                        <Select
                            options={[
                                { value: "car_model", label: "Avtomobil modeli" },
                                { value: "car_color", label: "Avtomobil rangi" },
                            ]}
                            placeholder="Turini tanlang"
                        />
                    </Form.Item>
                    <Form.Item
                        name="value"
                        label="Qiymati"
                        rules={[{ required: true, message: "Qiymatni kiriting" }]}
                    >
                        <Input placeholder="Masalan: Cobalt yoki Oq" />
                    </Form.Item>
                    <Form.Item name="sort_order" label="Tartib raqami" initialValue={0}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
