import React, { useMemo } from "react";
import {
    Card,
    Col,
    Divider,
    Flex,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Switch,
    Typography,
    Upload,
    Button,
    Spin
} from "antd";
import type { FormInstance, } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import type {
    FulfillmentMode,
    PaymentMethod,
    PriceTier,
    RestaurantStatus,
} from "../../types/restaurant";
import { RestaurantOwnersAPI, type RestaurantOwner } from "../../api/restaurant-owners";
import { CuisineTypes } from "./CuisineTypes";

const { Title, Text } = Typography;

export type RestaurantFormValues = {
    ownerUserId?: string;

    cuisineTypeId?: string;

    status: RestaurantStatus;

    name: string;
    description?: string;
    phone: string;

    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    postalCode?: string;
    country?: string;

    lat?: number;
    lng?: number;

    cuisine_types: string[];
    tags?: string[];
    price_tier?: PriceTier;

    is_open: boolean;
    accepting_orders: boolean;
    temporarily_closed_reason?: string;

    timezone?: string;

    fulfillment_modes: FulfillmentMode[];
    payment_methods: PaymentMethod[];
    supports_scheduled_orders: boolean;
    auto_accept_orders: boolean;

    prep_time_min: number;
    prep_time_max: number;

    min_order_amount: number;

    delivery_radius_km: number;
    delivery_fee_base: number;
    delivery_fee_per_km?: number;
    delivery_fee_min?: number;
    delivery_fee_max?: number;
    delivery_free_over_amount?: number;

    currency: string;
    commission_percent: number;
};

type Props = {
    form: FormInstance<RestaurantFormValues>;
    disabled?: boolean;

    initialValues?: Partial<RestaurantFormValues>;

    onFinish?: (values: RestaurantFormValues) => void;
    footer?: React.ReactNode;

    logoFileList: UploadFile[];
    setLogoFileList: (v: UploadFile[]) => void;
    bannerFileList: UploadFile[];
    setBannerFileList: (v: UploadFile[]) => void;
    galleryFileList: UploadFile[];
    setGalleryFileList: (v: UploadFile[]) => void;

    title?: string;
    showStatusField?: boolean;
};

const CURRENCIES = ["UZS", "USD", "EUR"];

const STATUS_OPTIONS: RestaurantStatus[] = ["ACTIVE", "SUSPENDED", "DELETED"];
const PRICE_TIERS: PriceTier[] = [1, 2, 3, 4];

const FULFILLMENT: FulfillmentMode[] = ["DELIVERY", "PICKUP"];
const PAYMENTS: PaymentMethod[] = ["CASH", "CARD", "WALLET"];

export function RestaurantForm({
    form,
    logoFileList,
    setLogoFileList,
    bannerFileList,
    setBannerFileList,
    galleryFileList,
    setGalleryFileList,
    title = "Restoran",
    showStatusField = true,
    footer,
    onFinish
}: Props) {
    const acceptingOrders = Form.useWatch("accepting_orders", form);

    const [ownersLoading, setOwnersLoading] = React.useState(false);
    const [owners, setOwners] = React.useState<RestaurantOwner[]>([]);

    const initialValues = useMemo<Partial<RestaurantFormValues>>(
        () => ({
            status: "ACTIVE",
            is_open: true,
            accepting_orders: true,
            cuisine_types: [],
            tags: [],
            fulfillment_modes: ["DELIVERY"],
            payment_methods: ["CASH"],
            supports_scheduled_orders: false,
            auto_accept_orders: false,
            prep_time_min: 15,
            prep_time_max: 45,
            min_order_amount: 0,
            delivery_radius_km: 8,
            delivery_fee_base: 0,
            currency: "UZS",
            commission_percent: 0,
        }),
        []
    );

    const defaults = useMemo<Partial<RestaurantFormValues>>(
        () => ({
            status: "ACTIVE",
            is_open: true,
            accepting_orders: true,
            cuisine_types: [],
            tags: [],
            fulfillment_modes: ["DELIVERY"],
            payment_methods: ["CASH"],
            supports_scheduled_orders: false,
            auto_accept_orders: false,
            prep_time_min: 15,
            prep_time_max: 45,
            min_order_amount: 0,
            delivery_radius_km: 8,
            delivery_fee_base: 0,
            currency: "UZS",
            commission_percent: 0,
        }),
        []
    );


    const fetchOwners = async (search?: string) => {
        setOwnersLoading(true);
        try {
            const res = await RestaurantOwnersAPI.getRestaurantOwners({
                page: 1,
                pageSize: 50,
                q: search?.trim() || undefined,
                onlyActive: true,
            });

            const body = res.data;
            if (body.ok) setOwners(body.owners ?? []);
            else setOwners([]);
        } finally {
            setOwnersLoading(false);
        }
    };

    React.useEffect(() => {
        fetchOwners();
    }, []);


    return (
        <Form form={form} layout="vertical" initialValues={{ ...defaults, ...initialValues }} requiredMark="optional" onFinish={onFinish}
        >
            <Card>
                <Title level={4} style={{ marginTop: 0 }}>
                    {title}
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="ownerUserId"
                            label="Egasi"
                            rules={[{ required: true, message: "Egasini tanlang" }]}
                            tooltip="Bu foydalanuvchi restoranni boshqaradi"
                        >
                            <Select
                                showSearch
                                placeholder="Restoran egasini tanlang..."
                                filterOption={false}
                                onSearch={(val) => fetchOwners(val)}
                                onDropdownVisibleChange={(open) => {
                                    if (open && owners.length === 0) fetchOwners();
                                }}
                                notFoundContent={ownersLoading ? <Spin size="small" /> : "Egalar topilmadi"}
                                options={owners.map((o) => ({
                                    value: o._id,
                                    label: `${o.fullName} — ${o.email}${o.phone ? ` (${o.phone})` : ""}`,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {showStatusField && (
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item name="status" label="Holat" rules={[{ required: true }]}>
                                <Select options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))} />
                            </Form.Item>
                        </Col>
                    </Row>
                )}



                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="name" label="Nomi" rules={[{ required: true, message: "Nom majburiy" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="phone" label="Telefon" rules={[{ required: true, message: "Telefon majburiy" }]}>
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item name="description" label="Tavsif">
                            <Input.TextArea rows={3} placeholder="Qisqa tavsif..." />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Manzil
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="addressLine1" label="Manzil 1-qator" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="addressLine2" label="Manzil 2-qator">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="city" label="Shahar" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="region" label="Viloyat" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="postalCode" label="Pochta indeksi">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="country" label="Davlat">
                            <Input placeholder="UZ" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Joylashuv (Geo)
                </Title>
                <Text type="secondary">
                    GeoJSON <code>Point</code> formatida <code>[lng, lat]</code> saqlanadi.
                </Text>

                <Row gutter={16} style={{ marginTop: 8 }}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="lat"
                            label="Kenglik (Latitude)"
                            rules={[
                                {
                                    validator: (_, v) => {
                                        if (v === undefined || v === null || v === "") return Promise.resolve();
                                        const n = Number(v);
                                        if (!Number.isFinite(n) || n < -90 || n > 90) return Promise.reject("Kenglik -90..90 orasida bo'lishi kerak");
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <InputNumber style={{ width: "100%" }} placeholder="41.2995" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="lng"
                            label="Uzunlik (Longitude)"
                            rules={[
                                {
                                    validator: (_, v) => {
                                        if (v === undefined || v === null || v === "") return Promise.resolve();
                                        const n = Number(v);
                                        if (!Number.isFinite(n) || n < -180 || n > 180) return Promise.reject("Uzunlik -180..180 orasida bo'lishi kerak");
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <InputNumber style={{ width: "100%" }} placeholder="69.2401" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Marketplace
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="cuisineTypeId"
                            label="Oshxona turlari"
                            tooltip="Qidirish va filtrlash uchun ishlatiladi"
                            rules={[{ required: true, message: "Kamida 1 ta oshxona turi qo'shing" }]}
                        >
                            <CuisineTypes onChange={function (): void {
                                throw new Error("Function not implemented.");
                            }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item name="tags" label="Teglar">
                            <Select mode="tags" placeholder="Vegan, Oilaviy taomlar..." />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="price_tier" label="Narx darajasi">
                            <Select
                                allowClear
                                options={PRICE_TIERS.map((p) => ({ value: p, label: "$".repeat(p) }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="currency" label="Valyuta" rules={[{ required: true }]}>
                            <Select options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="commission_percent"
                            label="Komissiya %"
                            rules={[{ type: "number", min: 0, max: 100, message: "0..100" }]}
                        >
                            <InputNumber style={{ width: "100%" }} min={0} max={100} step={0.5} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Mavjudlik
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="is_open" label="Ochiq (qo'lda)" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="accepting_orders" label="Buyurtma qabul qilish" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="timezone" label="Vaqt mintaqasi">
                            <Input placeholder="Asia/Tashkent" />
                        </Form.Item>
                    </Col>

                    {!acceptingOrders ? (
                        <Col span={24}>
                            <Form.Item
                                name="temporarily_closed_reason"
                                label="Yopilish sababi (foydalanuvchilarga ko'rsatiladi)"
                                rules={[{ max: 300, message: "Maksimum 300 ta belgi" }]}
                            >
                                <Input placeholder="Oshxona band, keyinroq urinib ko'ring" />
                            </Form.Item>
                        </Col>
                    ) : null}
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Yetkazish va To'lov
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="fulfillment_modes" label="Yetkazish usullari" rules={[{ required: true }]}>
                            <Select mode="multiple" options={FULFILLMENT.map((v) => ({ value: v, label: v }))} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item name="payment_methods" label="To'lov usullari" rules={[{ required: true }]}>
                            <Select mode="multiple" options={PAYMENTS.map((v) => ({ value: v, label: v }))} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="supports_scheduled_orders" label="Rejalashtirilgan buyurtmalar" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="auto_accept_orders" label="Avtomatik qabul qilish" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Tayyorlash vaqti
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="prep_time_min" label="Minimal vaqt (daq)" rules={[{ required: true, type: "number", min: 1 }]}>
                            <InputNumber style={{ width: "100%" }} min={1} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item name="prep_time_max" label="Maksimal vaqt (daq)" rules={[{ required: true, type: "number", min: 1 }]}>
                            <InputNumber style={{ width: "100%" }} min={1} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Yetkazish sozlamalari
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="min_order_amount" label="Minimal buyurtma summasi" rules={[{ required: true, type: "number", min: 0 }]}>
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_radius_km" label="Radius (km)" rules={[{ required: true, type: "number", min: 0 }]}>
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_fee_base" label="Asosiy narx" rules={[{ required: true, type: "number", min: 0 }]}>
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_fee_per_km" label="Har km uchun narx">
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_fee_min" label="Minimal narx">
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_fee_max" label="Maksimal narx">
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_free_over_amount" label="Bepul yetkazish summasi">
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Media
                </Title>

                <Flex vertical style={{ width: "100%" }} gap={12}>
                    <Form.Item label="Logotip">
                        <Upload
                            accept="image/*"
                            listType="picture"
                            maxCount={1}
                            fileList={logoFileList}
                            beforeUpload={() => false}
                            onChange={({ fileList }) => setLogoFileList(fileList)}
                            onRemove={() => {
                                setLogoFileList([]);
                                return true;
                            }}
                        >
                            <Button>Logotip yuklash</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Banner">
                        <Upload
                            accept="image/*"
                            listType="picture"
                            maxCount={1}
                            fileList={bannerFileList}
                            beforeUpload={() => false}
                            onChange={({ fileList }) => setBannerFileList(fileList)}
                            onRemove={() => {
                                setBannerFileList([]);
                                return true;
                            }}
                        >
                            <Button>Banner yuklash</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Galereya (ixtiyoriy)">
                        <Upload
                            accept="image/*"
                            listType="picture"
                            multiple
                            fileList={galleryFileList}
                            beforeUpload={() => false}
                            onChange={({ fileList }) => setGalleryFileList(fileList)}
                        >
                            <Button>Galereya rasmlari yuklash</Button>
                        </Upload>
                    </Form.Item>
                    {footer ? <div style={{ marginTop: 16 }}>{footer}</div> : null}

                </Flex>
            </Card>
        </Form >
    );
}
