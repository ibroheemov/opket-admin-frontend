import { Alert, Button, Card, Form, Input, message, Skeleton, Typography } from "antd";
import { useEffect, useState } from "react";
import { AppVersionAPI, type AppVersionConfig } from "../../../api/app-version";

const { Text } = Typography;

const VERSION_RULE = {
    pattern: /^\d+\.\d+\.\d+$/,
    message: 'Versiya "1.2.3" formatida bo\'lishi kerak',
};

export default function AppVersionSettingsTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<AppVersionConfig>();

    useEffect(() => {
        AppVersionAPI.getConfig()
            .then((data) => form.setFieldsValue(data))
            .catch(() => message.error("Versiya sozlamalarini yuklashda xatolik"))
            .finally(() => setLoading(false));
    }, []);

    const onSave = async (values: AppVersionConfig) => {
        setSaving(true);
        try {
            await AppVersionAPI.updateConfig(values);
            message.success("Versiya sozlamalari yangilandi");
        } catch {
            message.error("Saqlashda xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: 560 }}>
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
                message="Qanday ishlaydi?"
                description={
                    <>
                        <Text>
                            <b>Min versiya</b> — bu versiyadan past bo'lgan foydalanuvchilar
                            ilovani <b>majburiy</b> yangilashlari kerak bo'ladi (bekor qilish imkoni yo'q).
                        </Text>
                        <br />
                        <Text>
                            <b>Oxirgi versiya</b> — bu versiyadan past bo'lganlar{" "}
                            <b>ixtiyoriy</b> yangilash taklifini ko'radi (bekor qilish mumkin).
                        </Text>
                    </>
                }
            />

            {loading ? (
                <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
                <Form form={form} layout="vertical" onFinish={onSave}>
                    <Card title="Yo'lovchi ilovasi" style={{ marginBottom: 16 }}>
                        <Form.Item
                            name="passenger_min_version"
                            label="Minimal versiya (majburiy yangilanish)"
                            rules={[{ required: true, message: "Majburiy" }, VERSION_RULE]}
                        >
                            <Input placeholder="1.5.0" />
                        </Form.Item>
                        <Form.Item
                            name="passenger_latest_version"
                            label="Oxirgi versiya (ixtiyoriy yangilanish)"
                            rules={[{ required: true, message: "Majburiy" }, VERSION_RULE]}
                            style={{ marginBottom: 0 }}
                        >
                            <Input placeholder="1.6.0" />
                        </Form.Item>
                    </Card>

                    <Card title="Haydovchi ilovasi" style={{ marginBottom: 24 }}>
                        <Form.Item
                            name="driver_min_version"
                            label="Minimal versiya (majburiy yangilanish)"
                            rules={[{ required: true, message: "Majburiy" }, VERSION_RULE]}
                        >
                            <Input placeholder="2.1.0" />
                        </Form.Item>
                        <Form.Item
                            name="driver_latest_version"
                            label="Oxirgi versiya (ixtiyoriy yangilanish)"
                            rules={[{ required: true, message: "Majburiy" }, VERSION_RULE]}
                            style={{ marginBottom: 0 }}
                        >
                            <Input placeholder="2.2.0" />
                        </Form.Item>
                    </Card>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={saving}>
                            Saqlash
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </div>
    );
}
