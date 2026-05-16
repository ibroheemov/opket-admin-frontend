import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Form,
    Input,
    Radio,
    Select,
    Spin,
    Typography,
    Space,
    Divider,
    Tag,
} from "antd";
import { SendOutlined } from "@ant-design/icons";
import { type EskizTemplate, type EskizBatchResult, MessagingAPI, type SendMessageResult } from "../../api/messaging";

const { Title, Text } = Typography;
const { TextArea } = Input;

function SmsBatchStatus({ result }: { result: EskizBatchResult }) {
    const statuses = Array.isArray(result.status) ? result.status : [result.status];
    const colorMap: Record<string, string> = {
        waiting: "processing",
        sent: "success",
        delivered: "success",
        failed: "error",
        rejected: "error",
    };
    return (
        <Space direction="vertical" size={2}>
            <Text type="secondary">
                Eskiz ID: <Text code>{result.id}</Text>
            </Text>
            <Text type="secondary">Holat: {result.message}</Text>
            <Space wrap>
                {statuses.map((s, i) => (
                    <Tag key={i} color={colorMap[s] ?? "default"}>{s}</Tag>
                ))}
            </Space>
        </Space>
    );
}

export default function MessagingPage() {
    const [form] = Form.useForm();

    const [templates, setTemplates] = useState<EskizTemplate[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<SendMessageResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const targetType = Form.useWatch("targetType", form);
    const audience = Form.useWatch("audience", form);

    useEffect(() => {
        setTemplatesLoading(true);
        MessagingAPI.getTemplates()
            .then(setTemplates)
            .catch(() => setTemplates([]))
            .finally(() => setTemplatesLoading(false));
    }, []);

    const handleTemplateSelect = (templateId: number) => {
        const tpl = templates.find((t) => t.id === templateId);
        if (tpl) form.setFieldValue("text", tpl.original_text);
    };

    const handleSend = async (values: any) => {
        setSending(true);
        setResult(null);
        setError(null);
        try {
            const ids =
                values.audience === "all"
                    ? "all"
                    : (values.ids ?? "")
                        .split(",")
                        .map((s: string) => s.trim())
                        .filter(Boolean);

            const res = await MessagingAPI.send({
                targetType: values.targetType,
                ids,
                title: values.title,
                text: values.text,
            });
            setResult(res);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? "Xatolik yuz berdi");
        } finally {
            setSending(false);
        }
    };

    const activeTemplates = templates.filter(
        (t) => t.status === "service" || t.status === "inproccess"
    );

    return (
        <div style={{ maxWidth: 720 }}>
            <Title level={4} style={{ marginBottom: 24 }}>
                Xabar yuborish
            </Title>

            <Form
                form={form}
                layout="vertical"
                initialValues={{ targetType: "passenger", audience: "all" }}
                onFinish={handleSend}
            >
                {/* Target type */}
                <Form.Item label="Kimga yuborish" name="targetType">
                    <Radio.Group>
                        <Radio.Button value="passenger">Yo'lovchilar</Radio.Button>
                        <Radio.Button value="driver">Haydovchilar</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                {/* Audience */}
                <Form.Item label="Qamrov" name="audience">
                    <Radio.Group>
                        <Radio.Button value="all">Barchaga</Radio.Button>
                        <Radio.Button value="selected">Tanlanganlarga</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                {audience === "selected" && (
                    <Form.Item
                        label={`${targetType === "driver" ? "Haydovchi" : "Yo'lovchi"} ID lari (vergul bilan)`}
                        name="ids"
                        rules={[{ required: true, message: "Kamida bitta ID kiriting" }]}
                    >
                        <TextArea
                            rows={2}
                            placeholder="64f3a1..., 64f3a2..., ..."
                        />
                    </Form.Item>
                )}

                <Divider />

                {/* Template picker */}
                <Form.Item label="SMS shabloni (ixtiyoriy)">
                    <Spin spinning={templatesLoading}>
                        <Select
                            placeholder="Shablon tanlang — matn avtomatik to'ldiriladi"
                            allowClear
                            onChange={handleTemplateSelect}
                            options={activeTemplates.map((t) => ({
                                value: t.id,
                                label: (
                                    <Space>
                                        <Text>{t.original_text.slice(0, 60)}{t.original_text.length > 60 ? "…" : ""}</Text>
                                        <Tag color="blue">{t.status}</Tag>
                                    </Space>
                                ),
                            }))}
                            style={{ width: "100%" }}
                        />
                    </Spin>
                </Form.Item>

                {/* Title (FCM) */}
                <Form.Item
                    label="Xabar sarlavhasi (FCM uchun)"
                    name="title"
                    rules={[{ required: true, message: "Sarlavha kiriting" }]}
                >
                    <Input placeholder="Muhim xabar" />
                </Form.Item>

                {/* Message text */}
                <Form.Item
                    label="Xabar matni"
                    name="text"
                    rules={[{ required: true, message: "Xabar matni kiriting" }]}
                >
                    <TextArea rows={4} placeholder="Xabar matni..." showCount maxLength={500} />
                </Form.Item>

                <Card size="small" style={{ marginBottom: 16, background: "#fafafa" }}>
                    <Text type="secondary">
                        Bildirishnomalar yoqilgan foydalanuvchilarga <strong>FCM</strong> orqali,{" "}
                        yoqilmaganlarga <strong>SMS</strong> orqali yuboriladi.
                    </Text>
                </Card>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SendOutlined />}
                        loading={sending}
                        size="large"
                    >
                        Yuborish
                    </Button>
                </Form.Item>
            </Form>

            {result && (
                <Alert
                    type="success"
                    showIcon
                    message="Xabar yuborildi"
                    description={
                        <Space direction="vertical" size={4}>
                            {result.fcm.sent > 0 && (
                                <Text>
                                    FCM: {result.fcm.sent} ta yuborildi ({result.fcm.successCount} muvaffaqiyatli
                                    {result.fcm.failureCount > 0 && `, ${result.fcm.failureCount} muvaffaqiyatsiz`})
                                </Text>
                            )}
                            {result.sms.sent > 0 && (
                                <Space direction="vertical" size={2}>
                                    <Text>SMS: {result.sms.sent} ta yuborildi</Text>
                                    {result.sms.result && <SmsBatchStatus result={result.sms.result} />}
                                </Space>
                            )}
                            {result.fcm.sent === 0 && result.sms.sent === 0 && (
                                <Text>Yuborish uchun foydalanuvchilar topilmadi</Text>
                            )}
                        </Space>
                    }
                    style={{ marginTop: 16 }}
                />
            )}

            {error && (
                <Alert
                    type="error"
                    showIcon
                    message="Xatolik"
                    description={error}
                    style={{ marginTop: 16 }}
                />
            )}
        </div>
    );
}
