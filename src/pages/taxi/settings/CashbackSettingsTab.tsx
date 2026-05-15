import { Button, Card, Form, InputNumber, message, Skeleton, Typography } from "antd";
import { useEffect, useState } from "react";
import { CashbackAPI } from "../../../api/cashback";

const { Text } = Typography;

type FormValues = { cashback: number };

const numberFieldProps = {
    min: 0,
    step: 1000,
    style: { width: "100%" },
    formatter: (value: number | undefined) =>
        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " "),
    parser: (value: string | undefined) =>
        (Number(value?.replace(/\s/g, "") ?? 0)) as 0,
    addonAfter: "UZS",
};

export default function CashbackSettingsTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<FormValues>();

    useEffect(() => {
        CashbackAPI.getSettings()
            .then(({ cashback }) => form.setFieldsValue({ cashback }))
            .catch(() => message.error("Keshbek sozlamalarini yuklashda xatolik"))
            .finally(() => setLoading(false));
    }, []);

    const onSave = async (values: FormValues) => {
        setSaving(true);
        try {
            await CashbackAPI.updateSettings(values.cashback);
            message.success("Keshbek miqdori yangilandi");
        } catch {
            message.error("Saqlashda xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: 520 }}>
            <Card title="Keshbek sozlamalari" style={{ marginBottom: 24 }}>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Haydovchi safarni yakunlaganida yo'lovchi balansi avtomatik ravishda
                    shu miqdorga oshiriladi. 0 qiymat keshbekni o'chiradi.
                </Text>

                {loading ? (
                    <Skeleton active paragraph={{ rows: 2 }} />
                ) : (
                    <Form form={form} layout="vertical" onFinish={onSave}>
                        <Form.Item
                            name="cashback"
                            label="Keshbek miqdori (UZS)"
                            rules={[
                                { required: true, message: "Iltimos, miqdorni kiriting" },
                                { type: "number", min: 0, message: "Miqdor 0 dan kam bo'lmasligi kerak" },
                            ]}
                        >
                            <InputNumber {...numberFieldProps} placeholder="Masalan: 5000" />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button type="primary" htmlType="submit" loading={saving}>
                                Saqlash
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Card>
        </div>
    );
}
