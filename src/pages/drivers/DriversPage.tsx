import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Switch,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { type Driver, DriverAPI } from "../../api/endpoints";

const STATUS_OPTIONS: Driver["status"][] = ["online", "offline"];

export default function DriversPage() {
    const [loading, setLoading] = useState(false);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [total, setTotal] = useState(0);

    // table state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // filters
    const [status, setStatus] = useState<Driver["status"] | undefined>();
    const [q, setQ] = useState("");

    // edit modal
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Driver | null>(null);
    const [form] = Form.useForm<Partial<Driver>>();

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const res = await DriverAPI.list({
                page,
                pageSize,
                status,
                q: q.trim() || undefined,
                sortBy: "updatedAt",
                sortOrder: "desc",
            });
            setDrivers(res.drivers);
            setTotal(res.meta.total);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Failed to load drivers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, status]);

    const columns: ColumnsType<Driver> = useMemo(
        () => [
            {
                title: "Name",
                dataIndex: "name",
                render: (_, d) => (
                    <Flex vertical gap={0}>
                        <Typography.Text strong>{d.name}</Typography.Text>
                        <Typography.Text type="secondary">
                            {d.firstname} {d.lastname}
                        </Typography.Text>
                    </Flex>
                ),
            },
            { title: "Phone", dataIndex: "phone", width: 140 },
            { title: "Ilova Versiyasi", dataIndex: "appVersion", width: 140 },
            {
                title: "Vehicle",
                dataIndex: "vehicle",
                ellipsis: true,
            },
            {
                title: "Status",
                dataIndex: "status",
                width: 120,
                render: (v: Driver["status"]) => <Tag>{v}</Tag>,
            },
            {
                title: "Balance",
                dataIndex: "balance",
                width: 140,
                render: (v: number) => <Typography.Text>{v}</Typography.Text>,
            },
            {
                title: "Offers",
                dataIndex: "canReceiveOffers",
                width: 110,
                render: (v: boolean) => (v ? <Tag>Yes</Tag> : <Tag>No</Tag>),
            },
            {
                title: "",
                key: "actions",
                width: 90,
                render: (_, d) => (
                    <Button
                        type="link"
                        onClick={() => {
                            setEditing(d);
                            form.setFieldsValue({
                                firstname: d.firstname,
                                lastname: d.lastname,
                                name: d.name,
                                phone: d.phone,
                                balance: d.balance,
                                carModel: d.carModel,
                                carNumber: d.carNumber,
                                regionCode: d.regionCode,
                                carColor: d.carColor,
                                vehicle: d.vehicle,
                                status: d.status,
                                canReceiveOffers: d.canReceiveOffers,
                                enabledOptions: d.enabledOptions,
                            });
                            setOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                ),
            },
        ],
        [form]
    );

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

    const save = async () => {
        const values = await form.validateFields();
        if (!editing) return;

        try {
            const res = await DriverAPI.update(editing._id, values);
            message.success("Driver updated");
            setOpen(false);
            setEditing(null);
            fetchDrivers();
            return res;
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Update failed");
        }
    };

    return (
        <Flex vertical gap="middle" style={{ width: "100%" }}>
            <Typography.Title level={2} style={{ margin: 0 }}>
                Drivers
            </Typography.Title>

            {/* Filters */}
            <Space wrap>
                <Select
                    allowClear
                    placeholder="Status"
                    style={{ width: 160 }}
                    value={status}
                    onChange={(v) => {
                        setStatus(v);
                        setPage(1);
                    }}
                    options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))}
                />

                <Input.Search
                    allowClear
                    placeholder="Search name / phone / car number..."
                    style={{ width: 320 }}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onSearch={() => {
                        setPage(1);
                        fetchDrivers();
                    }}
                />

                <Button
                    onClick={() => {
                        setStatus(undefined);
                        setQ("");
                        setPage(1);
                        fetchDrivers();
                    }}
                >
                    Reset
                </Button>

                <Button onClick={fetchDrivers} loading={loading}>
                    Refresh
                </Button>
            </Space>

            <Table<Driver>
                rowKey="_id"
                loading={loading}
                columns={columns}
                dataSource={drivers}
                pagination={pagination}
            />

            <Modal
                title="Edit Driver"
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setEditing(null);
                }}
                onOk={save}
                okText="Save"
            >
                <Form layout="vertical" form={form}>
                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item label="Firstname" name="firstname" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Lastname" name="lastname" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                    </Space>

                    <Form.Item label="Display name" name="name">
                        <Input />
                    </Form.Item>

                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item label="Phone" name="phone" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Balance" name="balance" style={{ flex: 1 }}>
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item label="Car model" name="carModel" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Car color" name="carColor" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item label="Car number" name="carNumber" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Region code" name="regionCode" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                    </Space>

                    <Form.Item label="Vehicle" name="vehicle">
                        <Input />
                    </Form.Item>

                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                        <Form.Item label="Status" name="status" style={{ width: 200 }}>
                            <Select options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))} />
                        </Form.Item>

                        <Form.Item label="Can receive offers" name="canReceiveOffers" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Space>

                    <Form.Item label="Enabled options" name="enabledOptions">
                        <Select mode="tags" placeholder="Add options..." />
                    </Form.Item>
                </Form>
            </Modal>
        </Flex>
    );
}