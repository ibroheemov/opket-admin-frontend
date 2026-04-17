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
    Upload,
    message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import { type Driver, DriverAPI, type RegisterDriverPayload } from "../../api/endpoints";

const STATUS_OPTIONS: Driver["status"][] = ["online", "offline"];

export default function DriversPage() {
    const [loading, setLoading] = useState(false);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [total, setTotal] = useState(0);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [status, setStatus] = useState<Driver["status"] | undefined>();
    const [q, setQ] = useState("");

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Driver | null>(null);
    const [form] = Form.useForm<Partial<Driver>>();

    const [registerOpen, setRegisterOpen] = useState(false);
    const [registerSaving, setRegisterSaving] = useState(false);
    const [registerForm] = Form.useForm<RegisterDriverPayload>();
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [licenseFileList, setLicenseFileList] = useState<UploadFile[]>([]);

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
            message.error(e?.response?.data?.message ?? "Haydovchilarni yuklashda xatolik");
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
                title: "Ism",
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
            { title: "Telefon", dataIndex: "phone", width: 140 },
            { title: "Ilova versiyasi", dataIndex: "appVersion", width: 140 },
            {
                title: "Mashina",
                dataIndex: "vehicle",
                ellipsis: true,
            },
            {
                title: "Holat",
                dataIndex: "status",
                width: 120,
                render: (v: Driver["status"]) => <Tag>{v}</Tag>,
            },
            {
                title: "Balans",
                dataIndex: "balance",
                width: 140,
                render: (v: number) => <Typography.Text>{v}</Typography.Text>,
            },
            {
                title: "Takliflar",
                dataIndex: "canReceiveOffers",
                width: 110,
                render: (v: boolean) => (v ? <Tag>Ha</Tag> : <Tag>Yo'q</Tag>),
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
                        Tahrirlash
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
            message.success("Haydovchi yangilandi");
            setOpen(false);
            setEditing(null);
            fetchDrivers();
            return res;
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Yangilash muvaffaqiyatsiz");
        }
    };

    const submitRegister = async () => {
        try {
            const values = await registerForm.validateFields();
            setRegisterSaving(true);

            const payload: RegisterDriverPayload = {
                firstname: values.firstname.trim(),
                lastname: values.lastname.trim(),
                car_model: values.car_model.trim(),
                car_color: values.car_color.trim(),
                car_number: values.car_number.trim(),
                region_code: values.region_code.trim(),
                phone: values.phone.trim(),
                password: values.password,
                driver_license: licenseFile ?? undefined,
            };

            const res = await DriverAPI.register(payload);
            message.success(res.message ?? "Haydovchi ro'yxatdan o'tkazildi");
            setRegisterOpen(false);
            registerForm.resetFields();
            setLicenseFile(null);
            setLicenseFileList([]);
            fetchDrivers();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Ro'yxatdan o'tkazish muvaffaqiyatsiz");
        } finally {
            setRegisterSaving(false);
        }
    };

    return (
        <Flex vertical gap="middle" style={{ width: "100%" }}>
            <Typography.Title level={2} style={{ margin: 0 }}>
                Haydovchilar
            </Typography.Title>

            <Space wrap>
                <Button
                    type="primary"
                    onClick={() => {
                        registerForm.resetFields();
                        setLicenseFile(null);
                        setLicenseFileList([]);
                        setRegisterOpen(true);
                    }}
                >
                    Haydovchi qo'shish
                </Button>

                <Select
                    allowClear
                    placeholder="Holat"
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
                    placeholder="Ism / telefon / mashina raqami..."
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
                    Tozalash
                </Button>

                <Button onClick={fetchDrivers} loading={loading}>
                    Yangilash
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
                title="Haydovchini tahrirlash"
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setEditing(null);
                }}
                onOk={save}
                okText="Saqlash"
            >
                <Form layout="vertical" form={form}>
                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item label="Ism" name="firstname" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Familiya" name="lastname" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                    </Space>

                    <Form.Item label="Ko'rsatiladigan ism" name="name">
                        <Input />
                    </Form.Item>

                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item label="Telefon" name="phone" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Balans" name="balance" style={{ flex: 1 }}>
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item label="Mashina modeli" name="carModel" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Mashina rangi" name="carColor" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item label="Mashina raqami" name="carNumber" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Viloyat kodi" name="regionCode" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                    </Space>

                    <Form.Item label="Mashina" name="vehicle">
                        <Input />
                    </Form.Item>

                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                        <Form.Item label="Holat" name="status" style={{ width: 200 }}>
                            <Select options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))} />
                        </Form.Item>

                        <Form.Item label="Taklif qabul qilish" name="canReceiveOffers" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Space>

                    <Form.Item label="Yoqilgan opsiyalar" name="enabledOptions">
                        <Select mode="tags" placeholder="Opsiya qo'shing..." />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Haydovchini ro'yxatdan o'tkazish"
                open={registerOpen}
                onCancel={() => {
                    setRegisterOpen(false);
                    registerForm.resetFields();
                    setLicenseFile(null);
                    setLicenseFileList([]);
                }}
                onOk={submitRegister}
                okText="Yaratish"
                confirmLoading={registerSaving}
                destroyOnHidden
            >
                <Form layout="vertical" form={registerForm} style={{ marginTop: 16 }}>
                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item
                            label="Ism"
                            name="firstname"
                            rules={[{ required: true, message: "Ismni kiriting" }]}
                            style={{ flex: 1 }}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Familiya"
                            name="lastname"
                            rules={[{ required: true, message: "Familiyani kiriting" }]}
                            style={{ flex: 1 }}
                        >
                            <Input />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item
                            label="Mashina modeli"
                            name="car_model"
                            rules={[{ required: true, message: "Modelni kiriting" }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Masalan: Cobalt" />
                        </Form.Item>
                        <Form.Item
                            label="Mashina rangi"
                            name="car_color"
                            rules={[{ required: true, message: "Rangni kiriting" }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Masalan: oq" />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item
                            label="Mashina raqami"
                            name="car_number"
                            rules={[{ required: true, message: "Raqamni kiriting" }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Masalan: 01A123BC" />
                        </Form.Item>
                        <Form.Item
                            label="Viloyat kodi"
                            name="region_code"
                            rules={[{ required: true, message: "Viloyat kodini kiriting" }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Masalan: 01" />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: "flex" }} size="middle">
                        <Form.Item
                            label="Telefon"
                            name="phone"
                            rules={[{ required: true, message: "Telefonni kiriting" }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="991234567" />
                        </Form.Item>
                        <Form.Item
                            label="Parol"
                            name="password"
                            rules={[{ required: true, message: "Parolni kiriting" }]}
                            style={{ flex: 1 }}
                        >
                            <Input.Password />
                        </Form.Item>
                    </Space>

                    <Form.Item label="Driver license (fayl)">
                        <Upload
                            fileList={licenseFileList}
                            maxCount={1}
                            beforeUpload={(file) => {
                                setLicenseFile(file);
                                setLicenseFileList([
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
                                setLicenseFile(null);
                                setLicenseFileList([]);
                            }}
                        >
                            <Button>Fayl tanlash</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </Flex>
    );
}
