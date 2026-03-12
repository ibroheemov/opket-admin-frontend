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
    price: number;
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

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Item | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<Partial<Item>>();

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
            message.error(e?.response?.data?.message ?? "Mahsulotlarni yuklashda xatolik");
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
        { title: "Nomi", dataIndex: "name" },
        {
            title: "Kategoriya",
            dataIndex: "categoryId",
            width: 180,
            render: (v) => {
                if (!v) return <Tag>Kategoriyasiz</Tag>;
                const c = categories.find((x) => x._id === v);
                return c ? c.name : v;
            },
        },
        {
            title: "Narx",
            dataIndex: "price",
            width: 120,
            render: (v: number) => v,
        },
        {
            title: "Mavjud",
            dataIndex: "is_available",
            width: 120,
            render: (v: boolean, row) => (
                <Switch
                    checked={v}
                    onChange={async (checked) => {
                        try {
                            setItems((prev) => prev.map((it) => (it._id === row._id ? { ...it, is_available: checked } : it)));
                        } catch (e: any) {
                            message.error(e?.response?.data?.message ?? "Yangilash muvaffaqiyatsiz");
                        }
                    }}
                />
            ),
        },
        {
            title: "Modifikatorlar",
            width: 110,
            render: (_, r) => (
                <Button type="link" onClick={() => setSelectedItem(r)}>
                    Boshqarish
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
                        Tahrirlash
                    </Button>

                    <Popconfirm
                        title="Mahsulotni o'chirasizmi?"
                        okText="O'chirish"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                            try {
                                await MenuAPI.deleteItem(row._id);
                                message.success("O'chirildi");
                                loadItems();
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

            const fd = new FormData();

            if (values.categoryId !== undefined) fd.append("categoryId", values.categoryId ?? "");
            fd.append("name", values.name ?? "");
            fd.append("description", values.description ?? "");
            fd.append("price", String(values.price ?? 0));
            fd.append("sort_order", String(values.sort_order ?? 0));
            fd.append("is_available", String(!!values.is_available));

            if (imageFile) fd.append("image", imageFile);

            if (editing) {
                await MenuAPI.updateItem(editing._id, fd);
                message.success("Yangilandi");
            } else {
                await MenuAPI.createItem(restaurantId, fd);
                message.success("Yaratildi");
            }

            setOpen(false);
            setEditing(null);
            setImageFile(null);
            setFileList([]);
            form.resetFields();
            loadItems();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Saqlash muvaffaqiyatsiz");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Space style={{ marginBottom: 12 }} wrap>
                <Select
                    allowClear
                    placeholder="Kategoriya bo'yicha"
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
                    Mahsulot qo'shish
                </Button>

                <Button onClick={loadItems} loading={loading}>
                    Yangilash
                </Button>
            </Space>

            <Table<Item> rowKey="_id" loading={loading} dataSource={items} columns={columns} pagination={false} />

            <Modal
                title={editing ? "Mahsulotni tahrirlash" : "Mahsulot qo'shish"}
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
                    <Form.Item name="categoryId" label="Kategoriya">
                        <Select allowClear options={categoryOptions} />
                    </Form.Item>

                    <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="description" label="Tavsif">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item name="price" label="Narx" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item label="Rasm">
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
                                return false;
                            }}
                            onRemove={() => {
                                setImageFile(null);
                                setFileList([]);
                            }}
                        >
                            <Button>Rasm yuklash</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item name="sort_order" label="Tartib raqami">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="is_available" label="Mavjud" valuePropName="checked">
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
