import { Button, Form, Input, InputNumber, Space, Switch, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../../api/client";
import type { Restaurant } from "../RestaurantsPage";
import type { UploadFile } from "antd/es/upload/interface";

export default function ProfileTab({ restaurantId }: { restaurantId: string }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<Partial<Restaurant>>();
    const [bannerFileList, setBannerFileList] = useState<UploadFile[]>([]);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get<{ success: boolean; restaurant: Restaurant }>(`/restaurants/${restaurantId}`);
            form.setFieldsValue(res.data.restaurant);
            setBannerUrl(res.data.restaurant.banner_url ?? null);

            // show existing banner in Upload list (optional)
            if (res.data.restaurant.banner_url) {
                setBannerFileList([
                    {
                        uid: "-1",
                        name: "banner",
                        status: "done",
                        url: res.data.restaurant.banner_url,
                    },
                ]);
            } else {
                setBannerFileList([]);
            }
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Failed to load restaurant");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId]);
    const save = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const fd = new FormData();

            // append fields (strings)
            fd.append("name", values.name ?? "");
            fd.append("phone", values.phone ?? "");
            fd.append("address_line1", values.address_line1 ?? "");
            fd.append("address_line2", values.address_line2 ?? "");
            fd.append("city", values.city ?? "");
            fd.append("region", values.region ?? "");
            fd.append("postal_code", values.postal_code ?? "");
            fd.append("is_open", String(!!values.is_open));

            fd.append("min_order_amount", values.min_order_amount == null ? "" : String(values.min_order_amount));
            fd.append("delivery_fee_base", values.delivery_fee_base == null ? "" : String(values.delivery_fee_base));

            // banner file if user picked a new one
            const bannerFile = bannerFileList?.[0]?.originFileObj as File | undefined;
            if (bannerFile) {
                fd.append("banner", bannerFile); // must match upload.single("banner")
            }

            await api.patch(`/restaurants/${restaurantId}`, fd);

            message.success("Saved");
            await load();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Form form={form} layout="vertical" disabled={loading} style={{ maxWidth: 640 }}>
            <Space style={{ display: "flex" }} size="middle">
                <Form.Item name="name" label="Name" style={{ flex: 1 }} rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="phone" label="Phone" style={{ flex: 1 }} rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Space>

            <Form.Item label="Company banner">
                <Upload
                    accept="image/*"
                    listType="picture-card"
                    maxCount={1}
                    fileList={bannerFileList}
                    beforeUpload={() => false} // prevent auto upload
                    onChange={({ fileList }) => {
                        setBannerFileList(fileList);

                        // live preview when selecting new file
                        const f = fileList?.[0]?.originFileObj as File | undefined;
                        if (f) {
                            const url = URL.createObjectURL(f);
                            setBannerUrl(url);
                        }
                    }}
                    onRemove={() => {
                        setBannerUrl(null);
                        setBannerFileList([]);
                        return true;
                    }}
                >
                    Upload
                </Upload>

                {bannerUrl ? (
                    <img
                        src={bannerUrl}
                        alt="banner preview"
                        style={{ width: "100%", maxWidth: 640, borderRadius: 8 }}
                    />
                ) : (
                    <div style={{ opacity: 0.6 }}>No banner uploaded</div>
                )}
            </Form.Item>

            <Form.Item name="address_line1" label="Address line 1" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item name="address_line2" label="Address line 2">
                <Input />
            </Form.Item>

            <Space style={{ display: "flex" }} size="middle">
                <Form.Item name="city" label="City" style={{ flex: 1 }} rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="region" label="Region" style={{ flex: 1 }} rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Space>

            <Form.Item name="postal_code" label="Postal code">
                <Input />
            </Form.Item>

            <Space style={{ display: "flex" }} size="middle">
                <Form.Item name="min_order_amount" label="Min order amount (cents)" style={{ flex: 1 }}>
                    <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
                <Form.Item name="delivery_fee_base" label="Delivery fee base (cents)" style={{ flex: 1 }}>
                    <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
            </Space>

            <Form.Item name="is_open" label="Open (manual)" valuePropName="checked">
                <Switch />
            </Form.Item>

            <Button type="primary" onClick={save} loading={saving}>
                Save
            </Button>
        </Form>
    );
}