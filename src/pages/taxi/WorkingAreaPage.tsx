import { useEffect, useRef, useState } from "react";
import {
    Button, Drawer, Form, Input, InputNumber, Popconfirm,
    Space, Spin, Table, Typography, message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
    GoogleMap, Polygon, useJsApiLoader,
} from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";
import { WorkingAreaAPI, type LatLng, type WorkingArea, type WorkingAreaPayload } from "../../api/working-areas";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
const LIBRARIES: Libraries = ["drawing"];
const DEFAULT_CENTER = { lat: 41.1, lng: 71.15 };
const MAP_CONTAINER: React.CSSProperties = { width: "100%", height: 420, borderRadius: 8 };

const POLYGON_OPTIONS = {
    fillColor: "#2563eb",
    fillOpacity: 0.18,
    strokeColor: "#2563eb",
    strokeWeight: 2,
    editable: true,
    draggable: false,
};

export default function WorkingAreaPage() {
    const [areas, setAreas] = useState<WorkingArea[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<WorkingArea | null>(null);
    const [saving, setSaving] = useState(false);
    const [polygon, setPolygon] = useState<LatLng[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const polygonRef = useRef<google.maps.Polygon | null>(null);
    const [form] = Form.useForm();

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    const load = async () => {
        setLoading(true);
        try {
            setAreas(await WorkingAreaAPI.list());
        } catch {
            message.error("Hududlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditing(null);
        setPolygon([]);
        form.resetFields();
        setIsDrawing(false);
        setOpen(true);
    };

    const openEdit = (area: WorkingArea) => {
        setEditing(area);
        setPolygon(area.polygon);
        form.setFieldsValue({ name: area.name, fareMultiplierOutside: area.fareMultiplierOutside });
        setIsDrawing(false);
        setOpen(true);
    };

    const closeDrawer = () => {
        setOpen(false);
        setIsDrawing(false);
        polygonRef.current = null;
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (!isDrawing || !e.latLng) return;
        setPolygon((prev) => [...prev, { lat: e.latLng!.lat(), lng: e.latLng!.lng() }]);
    };

    const syncPolygonFromRef = () => {
        if (!polygonRef.current) return;
        const path = polygonRef.current.getPath().getArray();
        setPolygon(path.map((p) => ({ lat: p.lat(), lng: p.lng() })));
    };

    const submit = async () => {
        try {
            const values = await form.validateFields();
            if (polygon.length < 3) {
                message.warning("Kamida 3 ta nuqta belgiling");
                return;
            }
            setSaving(true);
            const payload: WorkingAreaPayload = { ...values, polygon };
            if (editing) {
                await WorkingAreaAPI.update(editing._id, payload);
                message.success("Yangilandi");
            } else {
                await WorkingAreaAPI.create(payload);
                message.success("Yaratildi");
            }
            closeDrawer();
            load();
        } catch {
            message.error("Saqlashda xatolik");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id: string) => {
        try {
            await WorkingAreaAPI.remove(id);
            message.success("O'chirildi");
            load();
        } catch {
            message.error("O'chirishda xatolik");
        }
    };

    const columns = [
        { title: "Nomi", dataIndex: "name", key: "name" },
        {
            title: "Ko'paytiruvchi (tashqarida)",
            dataIndex: "fareMultiplierOutside",
            key: "fareMultiplierOutside",
            width: 200,
        },
        {
            title: "Nuqtalar soni",
            key: "points",
            render: (_: unknown, row: WorkingArea) => row.polygon.length,
            width: 140,
        },
        {
            title: "Amallar",
            key: "actions",
            width: 100,
            render: (_: unknown, row: WorkingArea) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
                    <Popconfirm title="O'chirilsinmi?" onConfirm={() => remove(row._id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const mapCenter =
        polygon.length > 0
            ? polygon.reduce(
                (acc, p) => ({ lat: acc.lat + p.lat / polygon.length, lng: acc.lng + p.lng / polygon.length }),
                { lat: 0, lng: 0 }
            )
            : DEFAULT_CENTER;

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                    Ish hududlari
                </Typography.Title>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={load} />
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                        Hudud qo'shish
                    </Button>
                </Space>
            </div>

            <Table
                rowKey="_id"
                dataSource={areas}
                columns={columns}
                loading={loading}
                pagination={false}
            />

            <Drawer
                title={editing ? "Hududni tahrirlash" : "Yangi hudud"}
                placement="right"
                width={720}
                open={open}
                onClose={closeDrawer}
                extra={
                    <Button type="primary" loading={saving} onClick={submit}>
                        Saqlash
                    </Button>
                }
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Hudud nomi" rules={[{ required: true, message: "Nom kiriting" }]}>
                        <Input placeholder="Namangan" />
                    </Form.Item>
                    <Form.Item
                        name="fareMultiplierOutside"
                        label="Narx ko'paytiruvchisi (tashqarida)"
                        initialValue={2}
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={1} max={10} step={0.1} style={{ width: "100%" }} />
                    </Form.Item>
                </Form>

                <div style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
                    <Typography.Text strong>Polygon:</Typography.Text>
                    <Button
                        size="small"
                        type={isDrawing ? "primary" : "default"}
                        onClick={() => setIsDrawing((v) => !v)}
                    >
                        {isDrawing ? "Chizishni to'xtatish" : "Nuqta qo'shish"}
                    </Button>
                    {polygon.length > 0 && (
                        <Button size="small" danger onClick={() => setPolygon([])}>
                            Tozalash
                        </Button>
                    )}
                    <Typography.Text type="secondary">{polygon.length} ta nuqta</Typography.Text>
                </div>

                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={MAP_CONTAINER}
                        center={mapCenter}
                        zoom={12}
                        onClick={handleMapClick}
                        options={{ disableDefaultUI: false, clickableIcons: false }}
                    >
                        {polygon.length >= 2 && (
                            <Polygon
                                paths={polygon}
                                options={POLYGON_OPTIONS}
                                onLoad={(p) => { polygonRef.current = p; }}
                                onMouseUp={syncPolygonFromRef}
                            />
                        )}
                    </GoogleMap>
                ) : (
                    <div style={{ ...MAP_CONTAINER, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
                        <Spin />
                    </div>
                )}

                {isDrawing && (
                    <Typography.Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                        Xaritaga bosib polygon nuqtalarini belgilang. Kamida 3 ta nuqta kerak.
                    </Typography.Text>
                )}
            </Drawer>
        </>
    );
}
