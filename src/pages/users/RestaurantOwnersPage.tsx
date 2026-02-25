import { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, Space, Switch, Table, Tag, Typography, message } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { RestaurantOwnersAPI, type RestaurantOwner } from "../../api/restaurant-owners";
import CreateRestaurantOwnerForm from "./CreateRestaurantOwnerForm";
// import CreateRestaurantOwnerForm from "../components/CreateRestaurantOwnerForm";
// import {
//   RestaurantOwnersAPI,
//   type RestaurantOwner,
// } from "../api/RestaurantOwnersAPI";

export default function RestaurantOwnersPage() {
    const [msg, contextHolder] = message.useMessage();

    // data
    const [owners, setOwners] = useState<RestaurantOwner[]>([]);
    const [loading, setLoading] = useState(false);

    // server pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    // search + filter
    const [q, setQ] = useState("");
    const [onlyActive, setOnlyActive] = useState(false);

    // create modal
    const [open, setOpen] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await RestaurantOwnersAPI.getRestaurantOwners({
                page,
                pageSize,
                q: q.trim() || undefined,
                onlyActive,
            });

            const body = res.data;

            console.log(res);

            if (!body.ok) {
                msg.error("Failed to load restaurant owners");
                return;
            }
            setOwners(body.owners ?? []);
            setTotal(body.meta?.total ?? (body.owners?.length ?? 0));
        } catch (e: any) {
            msg.error(e?.response?.data?.message ?? "Failed to load restaurant owners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, onlyActive]);

    const pagination: TablePaginationConfig = useMemo(
        () => ({
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
        }),
        [page, pageSize, total]
    );

    const columns: ColumnsType<RestaurantOwner> = [
        { title: "Name", dataIndex: "fullName" },
        { title: "Email", dataIndex: "email" },
        { title: "Phone", dataIndex: "phone", width: 160, render: (v) => v ?? "-" },
        {
            title: "Active",
            dataIndex: "isActive",
            width: 110,
            render: (v: boolean) => (v ? <Tag color="green">Active</Tag> : <Tag>Disabled</Tag>),
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            width: 180,
            render: (v) => (v ? new Date(v).toLocaleString() : "-"),
        },
    ];

    return (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {contextHolder}

            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Restaurant Owners
                </Typography.Title>

                <Space>
                    <Input.Search
                        placeholder="Search name / email / phone..."
                        allowClear
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onSearch={() => {
                            setPage(1);
                            load();
                        }}
                        style={{ width: 320 }}
                    />

                    <Space align="center">
                        <Typography.Text>Only active</Typography.Text>
                        <Switch
                            checked={onlyActive}
                            onChange={(v) => {
                                setOnlyActive(v);
                                setPage(1);
                            }}
                        />
                    </Space>

                    <Button onClick={load} loading={loading}>
                        Refresh
                    </Button>

                    <Button type="primary" onClick={() => setOpen(true)}>
                        Create owner
                    </Button>
                </Space>
            </Space>

            <Table<RestaurantOwner>
                rowKey="_id"
                loading={loading}
                dataSource={owners}
                columns={columns}
                pagination={pagination}
            />

            <Modal
                title="Create Restaurant Owner"
                open={open}
                footer={null}
                onCancel={() => setOpen(false)}
                destroyOnClose
            >
                <CreateRestaurantOwnerForm
                    onCancel={() => setOpen(false)}
                    onSuccess={() => {
                        setOpen(false);
                        setPage(1);
                        load();
                    }}
                />
            </Modal>
        </Space>
    );
}