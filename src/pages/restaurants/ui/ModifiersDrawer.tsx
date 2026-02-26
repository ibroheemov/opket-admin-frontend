import { Button, Drawer, Flex, Form, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { MenuAPI } from "../../../api/menu";

type Item = { _id: string; name: string };
type Group = { _id: string; itemId: string; name: string; min_select: number; max_select: number };
type Option = { _id: string; groupId: string; name: string; price_delta: number; is_available: boolean };

export default function ModifiersDrawer({
    open,
    item,
    onClose,
}: {
    open: boolean;
    item: Item | null;
    onClose: () => void;
}) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [options, setOptions] = useState<Record<string, Option[]>>({});
    const [loading, setLoading] = useState(false);

    // group modal
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [groupSaving, setGroupSaving] = useState(false);
    const [groupForm] = Form.useForm<Partial<Group>>();

    // option modal
    const [optionModalOpen, setOptionModalOpen] = useState(false);
    const [activeGroup, setActiveGroup] = useState<Group | null>(null);
    const [optionSaving, setOptionSaving] = useState(false);
    const [optionForm] = Form.useForm<Partial<Option>>();

    const loadGroups = async () => {
        if (!item?._id) return;
        setLoading(true);
        try {
            const res = await MenuAPI.optionGroups(item._id);
            const gs: Group[] = res.data.groups ?? [];
            setGroups(gs);

            // load options for each group (simple + safe)
            const entries = await Promise.all(
                gs.map(async (g) => {
                    const r = await MenuAPI.options(g._id);
                    return [g._id, (r.data.options ?? []) as Option[]] as const;
                })
            );

            const map: Record<string, Option[]> = {};
            for (const [gid, opts] of entries) map[gid] = opts;
            setOptions(map);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Failed to load modifiers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) loadGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, item?._id]);

    const groupColumns: ColumnsType<Group> = [
        { title: "Group", dataIndex: "name" },
        { title: "Min", dataIndex: "min_select", width: 70 },
        { title: "Max", dataIndex: "max_select", width: 70 },
        {
            title: "",
            width: 220,
            render: (_, g) => (
                <Space>
                    <Button
                        onClick={() => {
                            setActiveGroup(g);
                            optionForm.setFieldsValue({ is_available: true, price_delta: 0 });
                            setOptionModalOpen(true);
                        }}
                    >
                        Add option
                    </Button>

                    <Popconfirm
                        title="Delete group? (options will be deleted too)"
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                            try {
                                await MenuAPI.deleteOptionGroup(g._id);
                                message.success("Deleted group");
                                loadGroups();
                            } catch (e: any) {
                                message.error(e?.response?.data?.message ?? "Delete failed");
                            }
                        }}
                    >
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const optionColumns: ColumnsType<Option> = [
        { title: "Option", dataIndex: "name" },
        {
            title: "Price +",
            dataIndex: "price_delta",
            width: 110,
            render: (v: number) => (v / 100).toFixed(2),
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
                            await MenuAPI.updateOption(row._id, { is_available: checked });
                            setOptions((prev) => ({
                                ...prev,
                                [row.groupId]: (prev[row.groupId] ?? []).map((o) => (o._id === row._id ? { ...o, is_available: checked } : o)),
                            }));
                        } catch (e: any) {
                            message.error(e?.response?.data?.message ?? "Update failed");
                        }
                    }}
                />
            ),
        },
        {
            title: "",
            width: 100,
            render: (_, row) => (
                <Popconfirm
                    title="Delete option?"
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={async () => {
                        try {
                            await MenuAPI.deleteOption(row._id);
                            message.success("Deleted option");
                            loadGroups();
                        } catch (e: any) {
                            message.error(e?.response?.data?.message ?? "Delete failed");
                        }
                    }}
                >
                    <Button type="link" danger>
                        Delete
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    const createGroup = async () => {
        if (!item?._id) return;
        try {
            const values = await groupForm.validateFields();
            setGroupSaving(true);
            await MenuAPI.createOptionGroup(item._id, values);
            message.success("Group created");
            setGroupModalOpen(false);
            groupForm.resetFields();
            loadGroups();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Create failed");
        } finally {
            setGroupSaving(false);
        }
    };

    const createOption = async () => {
        if (!activeGroup?._id) return;
        try {
            const values = await optionForm.validateFields();
            setOptionSaving(true);
            await MenuAPI.createOption(activeGroup._id, values);
            message.success("Option created");
            setOptionModalOpen(false);
            setActiveGroup(null);
            optionForm.resetFields();
            loadGroups();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Create failed");
        } finally {
            setOptionSaving(false);
        }
    };

    return (
        <Drawer open={open} onClose={onClose} title="Modifiers" size="large">
            <Flex vertical gap="middle" style={{ width: "100%" }}>
                <Typography.Text type="secondary">Item</Typography.Text>
                <Typography.Title level={4} style={{ margin: 0 }}>
                    {item?.name ?? "-"}
                </Typography.Title>

                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            groupForm.setFieldsValue({ min_select: 0, max_select: 1 });
                            setGroupModalOpen(true);
                        }}
                    >
                        Add group
                    </Button>
                    <Button onClick={loadGroups} loading={loading}>
                        Refresh
                    </Button>
                </Space>

                <Table<Group>
                    rowKey="_id"
                    loading={loading}
                    dataSource={groups}
                    columns={groupColumns}
                    pagination={false}
                    expandable={{
                        expandedRowRender: (g) => (
                            <Table<Option>
                                rowKey="_id"
                                dataSource={options[g._id] ?? []}
                                columns={optionColumns}
                                pagination={false}
                                size="small"
                            />
                        ),
                        rowExpandable: () => true,
                    }}
                />
            </Flex>

            {/* Create group modal */}
            <Modal
                title="Add option group"
                open={groupModalOpen}
                onCancel={() => setGroupModalOpen(false)}
                onOk={createGroup}
                confirmLoading={groupSaving}
            >
                <Form form={groupForm} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input placeholder='e.g., "Size"' />
                    </Form.Item>
                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item name="min_select" label="Min select" style={{ flex: 1 }}>
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item name="max_select" label="Max select" style={{ flex: 1 }}>
                            <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>

            {/* Create option modal */}
            <Modal
                title={`Add option${activeGroup?.name ? ` to "${activeGroup.name}"` : ""}`}
                open={optionModalOpen}
                onCancel={() => {
                    setOptionModalOpen(false);
                    setActiveGroup(null);
                }}
                onOk={createOption}
                confirmLoading={optionSaving}
            >
                <Form form={optionForm} layout="vertical" initialValues={{ is_available: true, price_delta: 0 }}>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input placeholder='e.g., "Large"' />
                    </Form.Item>
                    <Form.Item name="price_delta" label="Price delta (cents)">
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="is_available" label="Available" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </Drawer>
    );
}