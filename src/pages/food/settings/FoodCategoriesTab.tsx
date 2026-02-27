import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Upload, message, type UploadFile } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { MenuAPI } from "../../../api/menu";
import { FoodAPI } from "../../../api/food";

type Category = {
    _id: string;
    name: string;
    sort_order: number;
    image_url?: string | null;
};

type CategoryFormValues = {
    name: string;
    sort_order: number;
};

export default function FoodCategoriesTab() {
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm<CategoryFormValues>();

    const load = async () => {
        setLoading(true);
        try {
            const res = await FoodAPI.categories();
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
    }, []);

    const columns: ColumnsType<Category> = [
        { title: "Nomi", dataIndex: "name" },
        { title: "Tartib", dataIndex: "sort_order", width: 110 },
        {
            title: "Rasm",
            dataIndex: "image_url",
            width: 90,
            render: (url) =>
                url ? (
                    <img src={url} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }} />
                ) : (
                    <span style={{ opacity: 0.5 }}>—</span>
                ),
        },
        {
            title: "",
            width: 160,
            render: (_, row) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => openEdit(row)}
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

            const fd = new FormData();
            fd.append("name", values.name);
            fd.append("sort_order", String(values.sort_order ?? 0));
            if (imageFile) fd.append("image", imageFile);

            if (editing) {
                await FoodAPI.updateCategory(editing._id, fd);
                message.success("Yangilandi");
            } else {
                await FoodAPI.createCategory(fd);
                message.success("Yaratildi");
            }

            setOpen(false);
            setEditing(null);
            form.resetFields();
            setImageFile(null);
            setFileList([]);
            load();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Saqlash muvaffaqiyatsiz");
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (row: Category) => {
        setEditing(row);
        form.setFieldsValue({ name: row.name, sort_order: row.sort_order });

        setImageFile(null);
        if (row.image_url) {
            setFileList([
                {
                    uid: "existing",
                    name: "rasm",
                    status: "done",
                    url: row.image_url,
                },
            ]);
        } else {
            setFileList([]);
        }

        setOpen(true);
    };

    return (
        <>
            <Space style={{ marginBottom: 12 }}>
                <Button
                    type="primary"
                    onClick={() => {
                        setEditing(null);
                        form.resetFields();
                        setImageFile(null);
                        setFileList([]);
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
                    form.resetFields();
                    setImageFile(null);
                    setFileList([]);
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

                    <Form.Item label="Rasm">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            maxCount={1}
                            beforeUpload={(file) => {
                                setImageFile(file);
                                setFileList([
                                    {
                                        uid: file.uid,
                                        name: file.name,
                                        status: "done",
                                        originFileObj: file,
                                    } as any,
                                ]);
                                return false;
                            }}
                            onRemove={() => {
                                setImageFile(null);
                                setFileList([]);
                            }}
                        >
                            {fileList.length >= 1 ? null : "Yuklash"}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
