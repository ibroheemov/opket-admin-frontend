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

    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [groupSaving, setGroupSaving] = useState(false);
    const [groupForm] = Form.useForm<Partial<Group>>();

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
            message.error(e?.response?.data?.message ?? "Modifikatorlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) loadGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, item?._id]);

    const groupColumns: ColumnsType<Group> = [
        { title: "Guruh", dataIndex: "name" },
        { title: "Min", dataIndex: "min_select", width: 70 },
        { title: "Maks", dataIndex: "max_select", width: 70 },
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
                        Opsiya qo'shish
                    </Button>

                    <Popconfirm
                        title="Guruhni o'chirasizmi? (opsiyalar ham o'chiriladi)"
                        okText="O'chirish"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                            try {
                                await MenuAPI.deleteOptionGroup(g._id);
                                message.success("Guruh o'chirildi");
                                loadGroups();
                            } catch (e: any) {
                                message.error(e?.response?.data?.message ?? "O'chirish muvaffaqiyatsiz");
                            }
                        }}
                    >
                        <Button danger>O'chirish</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const optionColumns: ColumnsType<Option> = [
        { title: "Opsiya", dataIndex: "name" },
        {
            title: "Narx +",
            dataIndex: "price_delta",
            width: 110,
            render: (v: number) => (v / 100).toFixed(2),
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
                            await MenuAPI.updateOption(row._id, { is_available: checked });
                            setOptions((prev) => ({
                                ...prev,
                                [row.groupId]: (prev[row.groupId] ?? []).map((o) => (o._id === row._id ? { ...o, is_available: checked } : o)),
                            }));
                        } catch (e: any) {
                            message.error(e?.response?.data?.message ?? "Yangilash muvaffaqiyatsiz");
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
                    title="Opsiyani o'chirasizmi?"
                    okText="O'chirish"
                    okButtonProps={{ danger: true }}
                    onConfirm={async () => {
                        try {
                            await MenuAPI.deleteOption(row._id);
                            message.success("Opsiya o'chirildi");
                            loadGroups();
                        } catch (e: any) {
                            message.error(e?.response?.data?.message ?? "O'chirish muvaffaqiyatsiz");
                        }
                    }}
                >
                    <Button type="link" danger>
                        O'chirish
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
            message.success("Guruh yaratildi");
            setGroupModalOpen(false);
            groupForm.resetFields();
            loadGroups();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Yaratish muvaffaqiyatsiz");
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
            message.success("Opsiya yaratildi");
            setOptionModalOpen(false);
            setActiveGroup(null);
            optionForm.resetFields();
            loadGroups();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Yaratish muvaffaqiyatsiz");
        } finally {
            setOptionSaving(false);
        }
    };

    return (
        <Drawer open={open} onClose={onClose} title="Modifikatorlar" size="large">
            <Flex vertical gap="middle" style={{ width: "100%" }}>
                <Typography.Text type="secondary">Mahsulot</Typography.Text>
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
                        Guruh qo'shish
                    </Button>
                    <Button onClick={loadGroups} loading={loading}>
                        Yangilash
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

            <Modal
                title="Opsiya guruhi qo'shish"
                open={groupModalOpen}
                onCancel={() => setGroupModalOpen(false)}
                onOk={createGroup}
                confirmLoading={groupSaving}
            >
                <Form form={groupForm} layout="vertical">
                    <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
                        <Input placeholder='Masalan, "Hajmi"' />
                    </Form.Item>
                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item name="min_select" label="Min tanlash" style={{ flex: 1 }}>
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item name="max_select" label="Maks tanlash" style={{ flex: 1 }}>
                            <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>

            <Modal
                title={`Opsiya qo'shish${activeGroup?.name ? ` "${activeGroup.name}" ga` : ""}`}
                open={optionModalOpen}
                onCancel={() => {
                    setOptionModalOpen(false);
                    setActiveGroup(null);
                }}
                onOk={createOption}
                confirmLoading={optionSaving}
            >
                <Form form={optionForm} layout="vertical" initialValues={{ is_available: true, price_delta: 0 }}>
                    <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
                        <Input placeholder='Masalan, "Katta"' />
                    </Form.Item>
                    <Form.Item name="price_delta" label="Narx farqi (tiyin)">
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="is_available" label="Mavjud" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </Drawer>
    );
}
