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
            message.error(e?.response?.data?.message ?? "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId]);

    const columns: ColumnsType<Category> = [
        { title: "Name", dataIndex: "name" },
        { title: "Order", dataIndex: "sort_order", width: 110 },
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
                        Edit
                    </Button>

                    <Popconfirm
                        title="Delete category?"
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                            try {
                                await MenuAPI.deleteCategory(row._id);
                                message.success("Deleted");
                                load();
                            } catch (e: any) {
                                message.error(e?.response?.data?.message ?? "Delete failed");
                            }
                        }}
                    >
                        <Button type="link" danger>
                            Delete
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
                message.success("Updated");
            } else {
                await MenuAPI.createCategory(restaurantId, values);
                message.success("Created");
            }

            setOpen(false);
            setEditing(null);
            form.resetFields();
            load();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Save failed");
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
                    Add Category
                </Button>

                <Button onClick={load} loading={loading}>
                    Refresh
                </Button>
            </Space>

            <Table<Category> rowKey="_id" loading={loading} dataSource={data} columns={columns} pagination={false} />

            <Modal
                title={editing ? "Edit Category" : "Add Category"}
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setEditing(null);
                }}
                onOk={submit}
                confirmLoading={saving}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="sort_order" label="Sort order" initialValue={0}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}