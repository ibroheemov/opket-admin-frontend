import { useEffect, useState } from "react";
import { Button, Flex, Input, Modal, Space, Table, Typography, message, Form } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import { useNavigate } from "react-router-dom";
import type { Restaurant } from "../../types/restaurant";
import { RestaurantForm, type RestaurantFormValues } from "./RestaurantForm";
import { buildRestaurantFormData } from "./utils/restaurantPayload";
import { api } from "../../api/client";
import React from "react";

type ListResponse = {
    success: boolean;
    restaurants: Restaurant[];
    meta?: { page: number; pageSize: number; total: number; totalPages: number };
};

export default function RestaurantsPage() {
    const nav = useNavigate();
    const [msg, contextHolder] = message.useMessage();

    const [data, setData] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const [q, setQ] = useState("");

    const [open, setOpen] = useState(false);
    const [creating] = useState(false);


    const [form] = Form.useForm<RestaurantFormValues>();
    const [saving, setSaving] = React.useState(false);

    const [logoFileList, setLogoFileList] = React.useState<UploadFile[]>([]);
    const [bannerFileList, setBannerFileList] = React.useState<UploadFile[]>([]);
    const [galleryFileList, setGalleryFileList] = React.useState<UploadFile[]>([]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get<ListResponse>("/restaurants", {
                params: { page, pageSize, q: q.trim() || undefined, status: "ALL" },
            });
            setData(res.data.restaurants ?? []);
            setTotal(res.data.meta?.total ?? (res.data.restaurants?.length ?? 0));
        } catch (e: any) {
            msg.error(e?.response?.data?.message ?? "Failed to load restaurants");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const columns: ColumnsType<Restaurant> = [
        { title: "Name", dataIndex: "name" },
        { title: "Phone", dataIndex: "phone", width: 140 },
        {
            title: "City",
            width: 180,
            render: (_, r) => `${r.address?.city ?? ""}, ${r.address?.region ?? ""}`,
        },
        { title: "Open", dataIndex: "is_open", width: 90, render: (v) => (v ? "Yes" : "No") },
        {
            title: "",
            width: 100,
            render: (_, r) => (
                <Button type="link" onClick={() => nav(`/app/restaurants/${r._id}`)}>
                    Manage
                </Button>
            ),
        },
    ];

    const pagination: TablePaginationConfig = {
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        onChange: (p, ps) => {
            setPage(p);
            if (ps && ps !== pageSize) {
                setPageSize(ps);
                setPage(1);
            }
        },
    };

    const onFinish = async (values: RestaurantFormValues) => {
        setSaving(true);
        try {
            const logoFile = logoFileList?.[0]?.originFileObj as File | undefined;
            const bannerFile = bannerFileList?.[0]?.originFileObj as File | undefined;
            const galleryFiles = (galleryFileList ?? [])
                .map((f) => f.originFileObj as File | undefined)
                .filter(Boolean) as File[];

            const fd = buildRestaurantFormData(values, { logoFile, bannerFile, galleryFiles });

            await api.post(`/restaurants`, fd);
            message.success("Created");
            // navigate away or reset
            // form.resetFields(); setLogoFileList([]); ...
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Create failed");
        } finally {
            setSaving(false);
        }
    };


    return (
        <Flex vertical gap="middle" style={{ width: "100%" }}>
            {contextHolder}

            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Restaurants
                </Typography.Title>

                <Space>
                    <Input.Search
                        placeholder="Search name / phone / city..."
                        allowClear
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onSearch={() => {
                            setPage(1);
                            load();
                        }}
                        style={{ width: 320 }}
                    />
                    <Button onClick={load} loading={loading}>
                        Refresh
                    </Button>
                    <Button type="primary" onClick={() => setOpen(true)}>
                        Create
                    </Button>
                </Space>
            </Space>

            <Table<Restaurant> rowKey="_id" loading={loading} dataSource={data} columns={columns} pagination={pagination} />

            <Modal
                title="Create Restaurant"
                open={open}
                onCancel={() => {
                    setOpen(false);
                    form.resetFields();
                    setLogoFileList([]);
                    setBannerFileList([]);
                    setGalleryFileList([]);
                }}
                // onOk={onF}
                okText="Create"
                confirmLoading={creating}
                width={900}
            >
                <RestaurantForm
                    form={form}
                    title="Create restaurant"
                    showStatusField={true}
                    logoFileList={logoFileList}
                    setLogoFileList={setLogoFileList}
                    bannerFileList={bannerFileList}
                    setBannerFileList={setBannerFileList}
                    galleryFileList={galleryFileList}
                    setGalleryFileList={setGalleryFileList}
                    onFinish={onFinish}
                    footer={
                        <Button type="primary" htmlType="submit" loading={saving}>
                            Create
                        </Button>
                    }
                />
            </Modal>
        </Flex>
    );
}