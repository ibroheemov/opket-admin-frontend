import {
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Select,
    Space,
    Switch,
    Table,
    Tag,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { MenuAPI } from "../../../api/menu";
import ModifiersDrawer from "../ui/ModifiersDrawer";
import { Upload } from "antd";
import type { UploadFile } from "antd";

type Category = { _id: string; name: string; sort_order: number };
type Item = {
    _id: string;
    restaurantId: string;
    categoryId?: string | null;
    name: string;
    description?: string | null;
    price: number; // cents
    is_available: boolean;
    image_url?: string | null;
    sort_order: number;
};


export default function ItemsTab({ restaurantId }: { restaurantId: string }) {
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

    // create/edit modal
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Item | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<Partial<Item>>();

    // modifiers drawer
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const categoryOptions = useMemo(
        () => categories.map((c) => ({ label: c.name, value: c._id })),
        [categories]
    );

    const loadCategories = async () => {
        const res = await MenuAPI.categories(restaurantId);
        setCategories(res.data.categories ?? []);
    };

    const loadItems = async () => {
        setLoading(true);
        try {
            const res = await MenuAPI.items(restaurantId, {
                categoryId: categoryFilter || undefined,
            });
            setItems(res.data.items ?? []);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Failed to load items");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories().catch(() => { });
    }, [restaurantId]);

    useEffect(() => {
        loadItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId, categoryFilter]);

    const columns: ColumnsType<Item> = [
        { title: "Name", dataIndex: "name" },
        {
            title: "Category",
            dataIndex: "categoryId",
            width: 180,
            render: (v) => {
                if (!v) return <Tag>Uncategorized</Tag>;
                const c = categories.find((x) => x._id === v);
                return c ? c.name : v;
            },
        },
        {
            title: "Price",
            dataIndex: "price",
            width: 120,
            render: (v: number) => v,
        },
        {
            title: "Available",
            dataIndex: "is_available",
            width: 120,
            render: (v: boolean, row) => (
                <Switch
                    checked={v}
                    onChange={async (checked) => {
                        try {
                            // await MenuAPI.updateItem(row._id, { is_available: checked });
                            setItems((prev) => prev.map((it) => (it._id === row._id ? { ...it, is_available: checked } : it)));
                        } catch (e: any) {
                            message.error(e?.response?.data?.message ?? "Update failed");
                        }
                    }}
                />
            ),
        },
        {
            title: "Modifiers",
            width: 110,
            render: (_, r) => (
                <Button type="link" onClick={() => setSelectedItem(r)}>
                    Manage
                </Button>
            ),
        },
        {
            title: "",
            width: 170,
            render: (_, row) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => {
                            setEditing(row);
                            form.setFieldsValue({
                                categoryId: row.categoryId ?? null,
                                name: row.name,
                                description: row.description ?? "",
                                price: row.price,
                                is_available: row.is_available,
                                image_url: row.image_url ?? "",
                                sort_order: row.sort_order,
                            });
                            setOpen(true);
                        }}
                    >
                        Edit
                    </Button>

                    <Popconfirm
                        title="Delete item?"
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                            try {
                                await MenuAPI.deleteItem(row._id);
                                message.success("Deleted");
                                loadItems();
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

            const fd = new FormData();

            // append normal fields
            if (values.categoryId !== undefined) fd.append("categoryId", values.categoryId ?? "");
            fd.append("name", values.name ?? "");
            fd.append("description", values.description ?? "");
            fd.append("price", String(values.price ?? 0));
            fd.append("sort_order", String(values.sort_order ?? 0));
            fd.append("is_available", String(!!values.is_available));

            // append file (ONLY if chosen)
            if (imageFile) fd.append("image", imageFile); // key name must match backend: "image"

            if (editing) {
                await MenuAPI.updateItem(editing._id, fd);
                message.success("Updated");
            } else {
                await MenuAPI.createItem(restaurantId, fd);
                message.success("Created");
            }

            setOpen(false);
            setEditing(null);
            setImageFile(null);
            setFileList([]);
            form.resetFields();
            loadItems();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Space style={{ marginBottom: 12 }} wrap>
                <Select
                    allowClear
                    placeholder="Filter by category"
                    style={{ width: 260 }}
                    value={categoryFilter}
                    onChange={(v) => setCategoryFilter(v)}
                    options={categoryOptions}
                />

                <Button
                    type="primary"
                    onClick={() => {
                        setEditing(null);
                        form.setFieldsValue({ is_available: true, sort_order: 0, price: 0, categoryId: null });
                        setOpen(true);
                    }}
                >
                    Add Item
                </Button>

                <Button onClick={loadItems} loading={loading}>
                    Refresh
                </Button>
            </Space>

            <Table<Item> rowKey="_id" loading={loading} dataSource={items} columns={columns} pagination={false} />

            <Modal
                title={editing ? "Edit Item" : "Add Item"}
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setEditing(null);
                    setImageFile(null);
                    setFileList([]);
                }}
                onOk={submit}
                confirmLoading={saving}
            >
                <Form form={form} layout="vertical" initialValues={{ is_available: true, sort_order: 0 }}>
                    <Form.Item name="categoryId" label="Category">
                        <Select allowClear options={categoryOptions} />
                    </Form.Item>

                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item name="price" label="Price (cents)" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item label="Image">
                        <Upload
                            accept="image/*"
                            maxCount={1}
                            listType="picture"
                            fileList={fileList}
                            beforeUpload={(file) => {
                                setImageFile(file);
                                setFileList([
                                    {
                                        uid: file.uid ?? String(Date.now()),
                                        name: file.name,
                                        status: "done",
                                        originFileObj: file,
                                    },
                                ]);
                                return false; // prevent auto upload
                            }}
                            onRemove={() => {
                                setImageFile(null);
                                setFileList([]);
                            }}
                        >
                            <Button>Upload image</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item name="sort_order" label="Sort order">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="is_available" label="Available" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            <ModifiersDrawer
                open={!!selectedItem}
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
            />
        </>
    );
}