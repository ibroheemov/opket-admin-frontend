import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Upload, message, type UploadFile } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { MenuAPI } from "../../../api/menu";
import { FoodAPI } from "../../../api/food";

type RestaurantType = {
    _id: string;
    name: string;
    sort_order: number;
    image_url?: string | null;
};

type CategoryFormValues = {
    name: string;
    sort_order: number;
};

export default function RestaurantTypesTab() {
    const [data, setData] = useState<RestaurantType[]>([]);
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<RestaurantType | null>(null);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm<CategoryFormValues>();

    const load = async () => {
        setLoading(true);
        try {
            const res = await FoodAPI.restaurantTypes();
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
    }, []);

    const columns: ColumnsType<RestaurantType> = [
        { title: "Name", dataIndex: "name" },
        { title: "Order", dataIndex: "sort_order", width: 110 },
        {
            title: "Image",
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

            const fd = new FormData();
            fd.append("name", values.name);
            fd.append("sort_order", String(values.sort_order ?? 0));
            if (imageFile) fd.append("image", imageFile);

            if (editing) {
                await FoodAPI.updaterestaurantType(editing._id, fd);
                message.success("Updated");
            } else {
                await FoodAPI.createrestaurantType(fd);
                message.success("Created");
            }

            setOpen(false);
            setEditing(null);
            form.resetFields();
            setImageFile(null);
            setFileList([]);
            load();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (row: RestaurantType) => {
        setEditing(row);
        form.setFieldsValue({ name: row.name, sort_order: row.sort_order });

        setImageFile(null);
        if (row.image_url) {
            setFileList([
                {
                    uid: "existing",
                    name: "image",
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
                    Add Category
                </Button>

                <Button onClick={load} loading={loading}>
                    Refresh
                </Button>
            </Space>

            <Table<RestaurantType> rowKey="_id" loading={loading} dataSource={data} columns={columns} pagination={false} />

            <Modal
                title={editing ? "Edit Category" : "Add Category"}
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
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="sort_order" label="Sort order" initialValue={0}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item label="Image">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            maxCount={1}
                            beforeUpload={(file) => {
                                // stop auto upload
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
                            {fileList.length >= 1 ? null : "Upload"}
                        </Upload>

                        {/* Optional: if editing and want to allow "remove existing image" */}
                        {/* You could add a checkbox that sends remove_image=true, see note below. */}
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}