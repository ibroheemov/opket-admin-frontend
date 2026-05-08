import {
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Space,
    Switch,
    Table,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { RideOptionsAPI, type RideOption, type RideOptionPayload } from "../../../api/ride-options";

type FormValues = RideOptionPayload;

export default function RideOptionsTab() {
    const [data, setData] = useState<RideOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<RideOption | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<FormValues>();

    const load = async () => {
        setLoading(true);
        try {
            const list = await RideOptionsAPI.list();
            setData(list);
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            message.error(err?.response?.data?.message ?? "Variantlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const columns: ColumnsType<RideOption> = [
        { title: "Tartib", dataIndex: "sort_order", width: 90 },
        { title: "Nomi", dataIndex: "title" },
        { title: "Yo’lovchi uchun nomi", dataIndex: "title_for_passenger" },
        { title: "Option ID", dataIndex: "option_id" },
        {
            title: "Darhol",
            dataIndex: "instant",
            width: 100,
            render: (v: boolean) => (v ? "Ha" : "Yo’q"),
        },
        {
            title: "Qo’shimcha narx",
            dataIndex: "charge",
            width: 140,
            render: (v: number) => (v != null ? String(v) : "—"),
        },
        {
            title: "",
            width: 200,
            render: (_, row) => (
                <Space>
                    <Button type="link" onClick={() => openEdit(row)}>
                        Tahrirlash
                    </Button>
                    <Popconfirm
                        title="Variantni o‘chirasizmi?"
                        okText="O‘chirish"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                            try {
                                await RideOptionsAPI.remove(row._id);
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

    const openEdit = (row: RideOption) => {
        setEditing(row);
        form.setFieldsValue({
            title: row.title,
            title_for_passenger: row.title_for_passenger,
            option_id: row.option_id,
            instant: row.instant,
            charge: row.charge,
            sort_order: row.sort_order ?? 0,
        });
        setOpen(true);
    };

    const submit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const payload: RideOptionPayload = {
                title: values.title.trim(),
                title_for_passenger: values.title_for_passenger.trim(),
                option_id: values.option_id.trim(),
                instant: values.instant,
                charge: Number(values.charge),
                sort_order: Number(values.sort_order ?? 0),
            };
            if (editing) {
                await RideOptionsAPI.update(editing._id, payload);
                message.success("Yangilandi");
            } else {
                await RideOptionsAPI.create(payload);
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
                        form.setFieldsValue({ instant: true, charge: 0 });
                        setOpen(true);
                    }}
                >
                    Variant qo‘shish
                </Button>
                <Button onClick={load} loading={loading}>
                    Yangilash
                </Button>
            </Space>

            <Table<RideOption>
                rowKey="_id"
                loading={loading}
                dataSource={data}
                columns={columns}
                pagination={false}
            />

            <Modal
                title={editing ? "Variantni tahrirlash" : "Variant qo‘shish"}
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
                    <Form.Item name="title" label="Nomi" rules={[{ required: true, message: "Nomini kiriting" }]}>
                        <Input placeholder="Masalan: Comfort" />
                    </Form.Item>
                    <Form.Item name="title_for_passenger" label="Yo'lovchi uchun nomi" rules={[{ required: true, message: "Nomini kiriting" }]}>
                        <Input placeholder="Masalan: Comfort" />
                    </Form.Item>
                    <Form.Item
                        name="option_id"
                        label="Option ID"
                        rules={[{ required: true, message: "Option ID kiriting" }]}
                    >
                        <Input placeholder="Masalan: comfort" />
                    </Form.Item>
                    <Form.Item name="instant" label="Darhol" valuePropName="checked" initialValue={true}>
                        <Switch />
                    </Form.Item>
                    <Form.Item
                        name="charge"
                        label="Qo’shimcha narx"
                        rules={[{ required: true, message: "Narxni kiriting" }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="sort_order" label="Tartib raqami" initialValue={0}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
