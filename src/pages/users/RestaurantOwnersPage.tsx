import { useEffect, useMemo, useState } from "react";
import { Button, Flex, Input, Modal, Space, Switch, Table, Tag, Typography, message } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { RestaurantOwnersAPI, type RestaurantOwner } from "../../api/restaurant-owners";
import CreateRestaurantOwnerForm from "./CreateRestaurantOwnerForm";

export default function RestaurantOwnersPage() {
    const [msg, contextHolder] = message.useMessage();

    const [owners, setOwners] = useState<RestaurantOwner[]>([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const [q, setQ] = useState("");
    const [onlyActive, setOnlyActive] = useState(false);

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
                msg.error("Restoran egalarini yuklashda xatolik");
                return;
            }
            setOwners(body.owners ?? []);
            setTotal(body.meta?.total ?? (body.owners?.length ?? 0));
        } catch (e: any) {
            msg.error(e?.response?.data?.message ?? "Restoran egalarini yuklashda xatolik");
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
        { title: "Ism", dataIndex: "fullName" },
        { title: "Email", dataIndex: "email" },
        { title: "Telefon", dataIndex: "phone", width: 160, render: (v) => v ?? "-" },
        {
            title: "Faollik",
            dataIndex: "isActive",
            width: 110,
            render: (v: boolean) => (v ? <Tag color="green">Faol</Tag> : <Tag>O'chirilgan</Tag>),
        },
        {
            title: "Yaratilgan",
            dataIndex: "createdAt",
            width: 180,
            render: (v) => (v ? new Date(v).toLocaleString() : "-"),
        },
    ];

    return (
        <Flex vertical gap="middle" style={{ width: "100%" }}>
            {contextHolder}

            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Restoran Egalari
                </Typography.Title>

                <Space>
                    <Input.Search
                        placeholder="Ism / email / telefon qidirish..."
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
                        <Typography.Text>Faqat faollar</Typography.Text>
                        <Switch
                            checked={onlyActive}
                            onChange={(v) => {
                                setOnlyActive(v);
                                setPage(1);
                            }}
                        />
                    </Space>

                    <Button onClick={load} loading={loading}>
                        Yangilash
                    </Button>

                    <Button type="primary" onClick={() => setOpen(true)}>
                        Egasi yaratish
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
                title="Restoran egasini yaratish"
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
        </Flex>
    );
}
