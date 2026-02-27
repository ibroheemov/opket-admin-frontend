import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { MenuAPI } from "../../../api/menu";

type Category = { _id: string; name: string; sort_order: number };

export default function CategoriesTab({ restaurantId }: { restaurantId: string }) {
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);

    const [form] = Form.useForm<Partial<Category>>();

    const load = async () => {
        setLoading(true);
        try {
            const res = await MenuAPI.categories(restaurantId);
            setData(res.data.categories ?? []);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Kategoriyalarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId]);

    const columns: ColumnsType<Category> = [
        { title: "Nomi", dataIndex: "name" },
        { title: "Tartib", dataIndex: "sort_order", width: 110 },
        {
            title: "",
            width: 160,
            render: (_, row) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => {
                            setEditing(row);
                            form.setFieldsValue({ name: row.name, sort_order: row.sort_order });
                            setOpen(true);
                        }}
                    >
                        Tahrirlash
                    </Button>

                    <Popconfirm
                        title="Kategoriyani o'chirasizmi?"
                        okText="O'chirish"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                            try {
                                await MenuAPI.deleteCategory(row._id);
                                message.success("O'chirildi");
                                load();
                            } catch (e: any) {
                                message.error(e?.response?.data?.message ?? "O'chirish muvaffaqiyatsiz");
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

    const submit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            if (editing) {
                await MenuAPI.updateCategory(editing._id, values);
                message.success("Yangilandi");
            } else {
                await MenuAPI.createCategory(restaurantId, values);
                message.success("Yaratildi");
            }

            setOpen(false);
            setEditing(null);
            form.resetFields();
            load();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Saqlash muvaffaqiyatsiz");
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
                        setOpen(true);
                    }}
                >
                    Kategoriya qo'shish
                </Button>

                <Button onClick={load} loading={loading}>
                    Yangilash
                </Button>
            </Space>

            <Table<Category> rowKey="_id" loading={loading} dataSource={data} columns={columns} pagination={false} />

            <Modal
                title={editing ? "Kategoriyani tahrirlash" : "Kategoriya qo'shish"}
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setEditing(null);
                }}
                onOk={submit}
                confirmLoading={saving}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="sort_order" label="Tartib raqami" initialValue={0}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
