import { useEffect, useMemo, useState } from "react";
import {
    Button,
    DatePicker,
    Drawer,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    message,
    type TagProps,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";
import { type Ride, RideAPI } from "../../api/endpoints";

const { RangePicker } = DatePicker;

export type RideStatus =
    | "pending"
    | "offered"
    | "accepted"
    | "arrived"
    | "started"
    | "completed"
    | "cancelled";

const STATUS_OPTIONS: Ride["status"][] = [
    "pending",
    "offered",
    "accepted",
    "arrived",
    "started",
    "completed",
    "cancelled",
];

export const rideStatusColor: Record<RideStatus, TagProps["color"]> = {
    pending: "default",     // gray
    offered: "blue",
    accepted: "cyan",
    arrived: "purple",
    started: "gold",
    completed: "green",
    cancelled: "red",
};

const TYPE_OPTIONS: Ride["type"][] = ["app", "bot"];
const RIDE_TYPE_OPTIONS: Ride["rideType"][] = ["standard", "premium", "comfort"];

function statusTag(status: RideStatus) {
    // keep it simple; no custom colors required
    return <Tag color={rideStatusColor[status]}>{status}</Tag>;
}

export default function RidesPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Ride[]>([]);
    const [total, setTotal] = useState(0);

    // server-side table statedd
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // filters
    const [status, setStatus] = useState<Ride["status"] | undefined>(undefined);
    const [type, setType] = useState<Ride["type"] | undefined>(undefined);
    const [rideType, setRideType] = useState<Ride["rideType"] | undefined>(undefined);
    const [q, setQ] = useState("");
    const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined);

    // drawer
    const [selected, setSelected] = useState<Ride | null>(null);

    const columns: ColumnsType<Ride> = useMemo(
        () => [
            {
                title: "Status",
                dataIndex: "status",
                width: 140,
                render: (v) => statusTag(v),
            },
            {
                title: "Ilova/Bot",
                dataIndex: "type",
                width: 100,
                render: (v) => <Tag>{v}</Tag>,
            },
            {
                title: "Telefon raqam",
                dataIndex: "userPhoneNumber",
                width: 120,
                render: (v: number) => <Typography.Text>{v}</Typography.Text>,
            },
            {
                title: "Buyurtma Turi",
                dataIndex: "rideType",
                width: 120,
                render: (v) => <Tag>{v}</Tag>,
            },
            {
                title: "Driver ID",
                dataIndex: "driverId",
                width: 160,
                render: (_, r) => {
                    const d = r.driverId; // now it's an object
                    return d ? `${d.carModel} • ${d.carColor} • ${d.carNumber}` : "-";
                },
            },
            {
                title: "Fare",
                dataIndex: "fare",
                width: 110,
                render: (v: number) => <Typography.Text>{v}</Typography.Text>,
            },
            {
                title: "Created",
                dataIndex: "createdAt",
                width: 170,
                render: (v?: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-"),
            },
            {
                title: "",
                key: "actions",
                width: 80,
                render: (_, row) => (
                    <Button type="link" onClick={() => setSelected(row)}>
                        View
                    </Button>
                ),
            },
        ],
        []
    );

    const fetchRides = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {
                page,
                pageSize,
                sortBy: "createdAt",
                sortOrder: "desc",
            };

            if (status) params.status = status;
            if (type) params.type = type;
            if (rideType) params.rideType = rideType;
            if (q.trim()) params.q = q.trim();
            if (dateRange) {
                params.from = dateRange[0];
                params.to = dateRange[1];
            }

            const res = await RideAPI.list(params);
            setData(res.rides);
            setTotal(res.meta.total);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Failed to load rides");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRides();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, status, type, rideType, dateRange]);

    const pagination: TablePaginationConfig = {
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        onChange: (nextPage, nextSize) => {
            setPage(nextPage);
            if (nextSize && nextSize !== pageSize) {
                setPageSize(nextSize);
                setPage(1);
            }
        },
    };

    return (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Typography.Title level={2} style={{ margin: 0 }}>
                Rides
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

                <Select
                    allowClear
                    placeholder="Type"
                    style={{ width: 140 }}
                    value={type}
                    onChange={(v) => {
                        setType(v);
                        setPage(1);
                    }}
                    options={TYPE_OPTIONS.map((t) => ({ label: t, value: t }))}
                />

                <Select
                    allowClear
                    placeholder="Ride Type"
                    style={{ width: 160 }}
                    value={rideType}
                    onChange={(v) => {
                        setRideType(v);
                        setPage(1);
                    }}
                    options={RIDE_TYPE_OPTIONS.map((rt) => ({ label: rt, value: rt }))}
                />

                <RangePicker
                    showTime
                    onChange={(values) => {
                        if (!values || values.length !== 2 || !values[0] || !values[1]) {
                            setDateRange(undefined);
                            setPage(1);
                            return;
                        }
                        setDateRange([values[0].toISOString(), values[1].toISOString()]);
                        setPage(1);
                    }}
                />

                <Input.Search
                    placeholder="Search address..."
                    style={{ width: 260 }}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onSearch={() => {
                        setPage(1);
                        fetchRides();
                    }}
                    allowClear
                />

                <Button
                    onClick={() => {
                        setStatus(undefined);
                        setType(undefined);
                        setRideType(undefined);
                        setDateRange(undefined);
                        setQ("");
                        setPage(1);
                    }}
                >
                    Reset
                </Button>

                <Button onClick={fetchRides} loading={loading}>
                    Refresh
                </Button>
            </Space>

            <Table<Ride>
                rowKey="_id"
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={pagination}
            />

            <Drawer
                title="Ride details"
                open={!!selected}
                onClose={() => setSelected(null)}
                width={520}
            >
                {selected && (
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <Typography.Text strong>ID:</Typography.Text>
                        <Typography.Paragraph copyable={{ text: selected._id }}>
                            {selected._id}
                        </Typography.Paragraph>

                        <Typography.Text strong>Status:</Typography.Text>
                        <div>{statusTag(selected.status)}</div>

                        <Typography.Text strong>User Chat ID:</Typography.Text>
                        <Typography.Text>{selected.userChatId}</Typography.Text>

                        {/* <Typography.Text strong>Driver ID:</Typography.Text>
                        <Typography.Text>{selected.driverId ?? "-"}</Typography.Text> */}

                        <Typography.Text strong>Pickup:</Typography.Text>
                        <Typography.Text>{selected.pickup?.address ?? "-"}</Typography.Text>

                        <Typography.Text strong>Dropoff:</Typography.Text>
                        <Typography.Text>{selected.dropoff?.address ?? "-"}</Typography.Text>

                        <Typography.Text strong>Fare:</Typography.Text>
                        <Typography.Text>{selected.fare}</Typography.Text>

                        <Typography.Text strong>Candidate Drivers:</Typography.Text>
                        <Typography.Paragraph>
                            {selected.candidateDrivers?.length
                                ? selected.candidateDrivers
                                    .map((c) => `${c.driverId} (${c.distKm} km)`)
                                    .join(", ")
                                : "-"}
                        </Typography.Paragraph>
                    </Space>
                )}
            </Drawer>
        </Space>
    );
}
