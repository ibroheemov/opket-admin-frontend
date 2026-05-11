import { Button, Card, Col, Form, InputNumber, Row, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { type RideSearchConfig, RideSearchConfigAPI } from "../../../api/ride-search-config";

type FormValues = RideSearchConfig;

const msToSeconds = (ms: number) => ms / 1000;
const secondsToMs = (s: number) => s * 1000;

export default function DriverSearchSettingsTab() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<FormValues>();

    const load = async () => {
        setLoading(true);
        try {
            const config = await RideSearchConfigAPI.get();
            form.setFieldsValue({
                ...config,
                searchDurationMs: msToSeconds(config.searchDurationMs),
                reofferAfterMs: msToSeconds(config.reofferAfterMs),
                stage1TtlMs: msToSeconds(config.stage1TtlMs),
                stage2TtlMs: msToSeconds(config.stage2TtlMs),
                stage3TtlMs: msToSeconds(config.stage3TtlMs),
                stage4TtlMs: msToSeconds(config.stage4TtlMs),
            });
        } catch {
            message.error("Sozlamalarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const submit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const payload: Partial<RideSearchConfig> = {
                searchDurationMs: secondsToMs(Number(values.searchDurationMs)),
                maxOffersPerDriver: Number(values.maxOffersPerDriver),
                reofferAfterMs: secondsToMs(Number(values.reofferAfterMs)),
                stage1RadiusKm: Number(values.stage1RadiusKm),
                stage1TtlMs: secondsToMs(Number(values.stage1TtlMs)),
                stage1BatchSize: Number(values.stage1BatchSize),
                stage2RadiusKm: Number(values.stage2RadiusKm),
                stage2TtlMs: secondsToMs(Number(values.stage2TtlMs)),
                stage2BatchSize: Number(values.stage2BatchSize),
                stage3RadiusKm: Number(values.stage3RadiusKm),
                stage3TtlMs: secondsToMs(Number(values.stage3TtlMs)),
                stage4RadiusKm: Number(values.stage4RadiusKm),
                stage4TtlMs: secondsToMs(Number(values.stage4TtlMs)),
            };

            await RideSearchConfigAPI.update(payload);
            message.success("Sozlamalar saqlandi");
        } catch (e: unknown) {
            const err = e as { errorFields?: unknown; response?: { data?: { message?: string } } };
            if (err?.errorFields) return;
            message.error(err?.response?.data?.message ?? "Saqlashda xatolik");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 32, textAlign: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Form form={form} layout="vertical" style={{ maxWidth: 900 }}>
            <Card title="Umumiy qidiruv sozlamalari" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="searchDurationMs"
                            label="Qidiruv davomiyligi (soniya)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={30} max={600} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="maxOffersPerDriver"
                            label="Haydovchiga max taklif soni"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={1} max={10} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="reofferAfterMs"
                            label="Rad etgandan keyin kutish (soniya)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={1} max={120} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card title="1-bosqich — Yaqin haydovchilar (to'liq ekran taklif)" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="stage1RadiusKm"
                            label="Radius (km)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0.1} max={20} step={0.1} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="stage1TtlMs"
                            label="Taklif muddati (soniya)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={1} max={120} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="stage1BatchSize"
                            label="Bir vaqtda haydovchilar soni"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={1} max={20} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card title="2-bosqich — Kengaytirilgan radius (to'liq ekran taklif)" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="stage2RadiusKm"
                            label="Radius (km)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0.1} max={20} step={0.1} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="stage2TtlMs"
                            label="Taklif muddati (soniya)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={1} max={120} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="stage2BatchSize"
                            label="Bir vaqtda haydovchilar soni"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={1} max={20} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card title="3-bosqich — Barcha haydovchilar (ro'yxat widget)" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="stage3RadiusKm"
                            label="Radius (km)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0.1} max={20} step={0.1} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="stage3TtlMs"
                            label="Taklif muddati (soniya)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={1} max={120} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card title="4-bosqich — Barcha haydovchilar, kengaytirilgan (ro'yxat widget, tier fallback)" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="stage4RadiusKm"
                            label="Radius (km)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={0.1} max={20} step={0.1} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="stage4TtlMs"
                            label="Taklif muddati (soniya)"
                            rules={[{ required: true, message: "Kiriting" }]}
                        >
                            <InputNumber min={1} max={120} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Button type="primary" onClick={submit} loading={saving}>
                Saqlash
            </Button>
        </Form>
    );
}
