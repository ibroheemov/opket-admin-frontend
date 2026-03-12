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

    // location input (we’ll convert to GeoJSON on submit)
    lat?: number;
    lng?: number;

    cuisine_types: string[];
    tags?: string[];
    price_tier?: PriceTier;

    is_open: boolean;
    accepting_orders: boolean;
    temporarily_closed_reason?: string;

    timezone?: string;
    // hours_json not included here (usually separate schedule editor)

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

    rating_avg: number;
};

type Props = {
    form: FormInstance<RestaurantFormValues>;
    disabled?: boolean;

    initialValues?: Partial<RestaurantFormValues>; // allow override from edit/create wrapper

    onFinish?: (values: RestaurantFormValues) => void;
    footer?: React.ReactNode; // optional save button area (wrapper can provide)

    // uploads...
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
    title = "Restaurant",
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
            rating_avg: 0,
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

    // initial load
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
                            label="Owner"
                            rules={[{ required: true, message: "Please select an owner" }]}
                            tooltip="This user will manage the restaurant"
                        >
                            <Select
                                showSearch
                                placeholder="Select restaurant owner..."
                                filterOption={false}
                                onSearch={(val) => fetchOwners(val)}
                                onDropdownVisibleChange={(open) => {
                                    if (open && owners.length === 0) fetchOwners();
                                }}
                                notFoundContent={ownersLoading ? <Spin size="small" /> : "No owners found"}
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
                            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                                <Select options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))} />
                            </Form.Item>
                        </Col>
                    </Row>
                )}



                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="phone" label="Phone" rules={[{ required: true, message: "Phone is required" }]}>
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea rows={3} placeholder="Short description..." />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Address
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="addressLine1" label="Address line 1" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="addressLine2" label="Address line 2">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="city" label="City" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="region" label="Region" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="postalCode" label="Postal code">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="country" label="Country">
                            <Input placeholder="UZ" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Location (Geo)
                </Title>
                <Text type="secondary">
                    Stored as GeoJSON <code>Point</code> with <code>[lng, lat]</code>.
                </Text>

                <Row gutter={16} style={{ marginTop: 8 }}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="lat"
                            label="Latitude"
                            rules={[
                                {
                                    validator: (_, v) => {
                                        if (v === undefined || v === null || v === "") return Promise.resolve();
                                        const n = Number(v);
                                        if (!Number.isFinite(n) || n < -90 || n > 90) return Promise.reject("Lat must be -90..90");
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
                            label="Longitude"
                            rules={[
                                {
                                    validator: (_, v) => {
                                        if (v === undefined || v === null || v === "") return Promise.resolve();
                                        const n = Number(v);
                                        if (!Number.isFinite(n) || n < -180 || n > 180) return Promise.reject("Lng must be -180..180");
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
                            label="Cuisine types"
                            tooltip="Used for filtering/search"
                            rules={[{ required: true, message: "Add at least 1 cuisine type" }]}
                        >
                            <CuisineTypes onChange={function (): void {
                                throw new Error("Function not implemented.");
                            }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item name="tags" label="Tags">
                            <Select mode="tags" placeholder="Vegan-friendly, Family meals..." />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="price_tier" label="Price tier">
                            <Select
                                allowClear
                                options={PRICE_TIERS.map((p) => ({ value: p, label: "$".repeat(p) }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
                            <Select options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="commission_percent"
                            label="Commission %"
                            rules={[{ type: "number", min: 0, max: 100, message: "0..100" }]}
                        >
                            <InputNumber style={{ width: "100%" }} min={0} max={100} step={0.5} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="rating_avg"
                            label="Rating"
                            rules={[{ type: "number", min: 0, max: 5, message: "0..5" }]}
                        >
                            <InputNumber style={{ width: "100%" }} min={0} max={5} step={0.1} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Availability
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="is_open" label="Open (manual)" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="accepting_orders" label="Accepting orders" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="timezone" label="Timezone">
                            <Input placeholder="Asia/Tashkent" />
                        </Form.Item>
                    </Col>

                    {!acceptingOrders ? (
                        <Col span={24}>
                            <Form.Item
                                name="temporarily_closed_reason"
                                label="Closed reason (shown to users)"
                                rules={[{ max: 300, message: "Max 300 chars" }]}
                            >
                                <Input placeholder="Kitchen is busy, please try later" />
                            </Form.Item>
                        </Col>
                    ) : null}
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Fulfillment & Payments
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="fulfillment_modes" label="Fulfillment modes" rules={[{ required: true }]}>
                            <Select mode="multiple" options={FULFILLMENT.map((v) => ({ value: v, label: v }))} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item name="payment_methods" label="Payment methods" rules={[{ required: true }]}>
                            <Select mode="multiple" options={PAYMENTS.map((v) => ({ value: v, label: v }))} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="supports_scheduled_orders" label="Scheduled orders" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="auto_accept_orders" label="Auto-accept orders" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Preparation time
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="prep_time_min" label="Prep time min (min)" rules={[{ required: true, type: "number", min: 1 }]}>
                            <InputNumber style={{ width: "100%" }} min={1} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item name="prep_time_max" label="Prep time max (min)" rules={[{ required: true, type: "number", min: 1 }]}>
                            <InputNumber style={{ width: "100%" }} min={1} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Delivery settings
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="min_order_amount" label="Min order amount" rules={[{ required: true, type: "number", min: 0 }]}>
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_radius_km" label="Radius (km)" rules={[{ required: true, type: "number", min: 0 }]}>
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_fee_base" label="Base fee" rules={[{ required: true, type: "number", min: 0 }]}>
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_fee_per_km" label="Fee per km">
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_fee_min" label="Min fee">
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_fee_max" label="Max fee">
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="delivery_free_over_amount" label="Free delivery over">
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginTop: 0 }}>
                    Media
                </Title>

                <Flex vertical style={{ width: "100%" }} gap={12}>
                    <Form.Item label="Logo">
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
                            <Button>Upload logo</Button>
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
                            <Button>Upload banner</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Gallery (optional)">
                        <Upload
                            accept="image/*"
                            listType="picture"
                            multiple
                            fileList={galleryFileList}
                            beforeUpload={() => false}
                            onChange={({ fileList }) => setGalleryFileList(fileList)}
                        >
                            <Button>Upload gallery images</Button>
                        </Upload>
                    </Form.Item>
                    {footer ? <div style={{ marginTop: 16 }}>{footer}</div> : null}

                </Flex>
            </Card>
        </Form >
    );
}