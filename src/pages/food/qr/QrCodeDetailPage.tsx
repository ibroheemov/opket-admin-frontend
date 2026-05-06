import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Form, Input, InputNumber, message, Space, Spin, Typography, Alert } from "antd";
import { PrinterOutlined, SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import QRCode from "qrcode";
import { RestaurantsAPI } from "../../../api/restaurants";

const { Title, Text } = Typography;

interface Restaurant {
    _id: string;
    name: string;
    slug: string;
    logo_url?: string | null;
}

const QR_BASE_DEFAULT = "https://qr.opketme.uz";

export default function QrCodeDetailPage() {
    const { id = "" } = useParams();
    const [r, setR] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const [tableCount, setTableCount] = useState(10);
    const [base, setBase] = useState(import.meta.env.VITE_QR_BASE_URL || QR_BASE_DEFAULT);

    async function load() {
        setLoading(true);
        try {
            const res = await RestaurantsAPI.getById(id);
            const body: any = res.data;
            const data = body?.restaurant ?? body?.data ?? body;
            setR(data);
            form.setFieldsValue({ slug: data.slug, name: data.name });
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Yuklab bo'lmadi");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

    async function saveSlug(values: { slug: string }) {
        setSaving(true);
        try {
            await RestaurantsAPI.update(id, { slug: values.slug.trim() });
            message.success("Saqlandi");
            await load();
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Saqlanmadi");
        } finally {
            setSaving(false);
        }
    }

    const qrUrls = useMemo(() => {
        if (!r) return [];
        const out: { table: number; url: string }[] = [];
        for (let i = 1; i <= tableCount; i++) {
            out.push({ table: i, url: `${base}/${r.slug}?t=${i}` });
        }
        return out;
    }, [r, tableCount, base]);

    const [qrSvgs, setQrSvgs] = useState<Record<number, string>>({});
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const next: Record<number, string> = {};
            for (const q of qrUrls) {
                try {
                    next[q.table] = await QRCode.toString(q.url, { type: "svg", margin: 1, width: 320 });
                } catch { /* skip */ }
            }
            if (!cancelled) setQrSvgs(next);
        })();
        return () => { cancelled = true; };
    }, [qrUrls]);

    if (loading) return <Spin />;
    if (!r) return <Alert type="error" message="Restoran topilmadi" />;

    return (
        <div>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} className="no-print">
                <Title level={4} style={{ margin: 0 }}>QR Kodlar — {r.name}</Title>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={load}>Yangilash</Button>
                    <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
                        Chop etish / PDF
                    </Button>
                </Space>
            </Space>

            <Card className="no-print" style={{ marginBottom: 16 }}>
                <Form form={form} layout="vertical" onFinish={saveSlug} initialValues={{ slug: r.slug, name: r.name }}>
                    <Space align="end" wrap>
                        <Form.Item label="Restoran nomi" name="name">
                            <Input disabled style={{ width: 260 }} />
                        </Form.Item>
                        <Form.Item label="Slug (URL kaliti)" name="slug" rules={[{ required: true, message: "Slug talab qilinadi" }]}>
                            <Input addonBefore={`${base}/`} style={{ width: 360 }} />
                        </Form.Item>
                        <Form.Item label=" ">
                            <Button htmlType="submit" type="primary" icon={<SaveOutlined />} loading={saving}>Saqlash</Button>
                        </Form.Item>
                    </Space>
                </Form>

                <Space wrap>
                    <Form.Item label="Stollar soni" style={{ marginBottom: 0 }}>
                        <InputNumber min={1} max={200} value={tableCount} onChange={(v) => setTableCount(Number(v) || 1)} />
                    </Form.Item>
                    <Form.Item label="Bazaviy URL" style={{ marginBottom: 0 }}>
                        <Input value={base} onChange={(e) => setBase(e.target.value)} style={{ width: 260 }} />
                    </Form.Item>
                </Space>

                <Alert
                    type="info"
                    showIcon
                    style={{ marginTop: 16 }}
                    message="Har stol uchun alohida QR kod chiqariladi. Chop etish tugmasi orqali brauzerning 'Save as PDF' funksiyasidan foydalaning."
                />
            </Card>

            {/* Print-friendly grid */}
            <div className="print-grid">
                {qrUrls.map((q) => (
                    <div key={q.table} className="print-card">
                        {r.logo_url && <img src={r.logo_url} alt="" className="print-logo" />}
                        <div className="print-name">{r.name}</div>
                        <div
                            className="print-qr"
                            dangerouslySetInnerHTML={{ __html: qrSvgs[q.table] || "" }}
                        />
                        <div className="print-table">Stol #{q.table}</div>
                        <Text type="secondary" style={{ fontSize: 11, wordBreak: "break-all" }}>{q.url}</Text>
                    </div>
                ))}
            </div>

            <style>{`
                .print-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }
                .print-card {
                    background: #fff;
                    border: 1px solid #e4e4e7;
                    border-radius: 16px;
                    padding: 24px;
                    text-align: center;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
                .print-logo { height: 36px; margin-bottom: 8px; object-fit: contain; }
                .print-name { font-weight: 700; font-size: 18px; margin-bottom: 12px; }
                .print-qr svg { width: 100%; height: auto; max-width: 320px; }
                .print-table { margin-top: 12px; font-weight: 800; font-size: 22px; }

                @media print {
                    .no-print, .ant-layout-sider, .ant-layout-header { display: none !important; }
                    .ant-layout-content, .ant-layout-content > div { padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
                    body { background: #fff !important; }
                    .print-grid { grid-template-columns: 1fr 1fr; }
                    .print-card { border: none; }
                }
            `}</style>
        </div>
    );
}
