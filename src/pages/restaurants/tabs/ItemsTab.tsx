import {
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Select,
    Switch,
    Tag,
    Tooltip,
    Upload,
    message,
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import { useEffect, useMemo, useState } from "react";
import { MenuAPI } from "../../../api/menu";
import ModifiersDrawer from "../ui/ModifiersDrawer";

type Category = { _id: string; name: string; sort_order: number };
type Item = {
    _id: string;
    restaurantId: string;
    categoryId?: string | null;
    name: string;
    description?: string | null;
    price: number;
    is_available: boolean;
    image_url?: string | null;
    sort_order: number;
};

const fmtSum = (v: number) => (v || 0).toLocaleString("uz-UZ");

export default function ItemsTab({ restaurantId }: { restaurantId: string }) {
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [activeCat, setActiveCat] = useState<string | null>(null);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Item | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<Partial<Item>>();

    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const categoryOptions = useMemo(
        () => categories.map((c) => ({ label: c.name, value: c._id })),
        [categories]
    );

    const loadCategories = async () => {
        const res = await MenuAPI.categories(restaurantId);
        setCategories(res.data.categories ?? []);
    };

    const loadItems = async () => {
        setLoading(true);
        try {
            const res = await MenuAPI.items(restaurantId);
            setItems(res.data.items ?? []);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Mahsulotlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories().catch(() => { });
    }, [restaurantId]);

    useEffect(() => {
        loadItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId]);

    const visibleItems = useMemo(() => {
        if (!activeCat) return items;
        if (activeCat === "_uncat") return items.filter((i) => !i.categoryId);
        return items.filter((i) => i.categoryId === activeCat);
    }, [items, activeCat]);

    const openAdd = () => {
        setEditing(null);
        setImageFile(null);
        setFileList([]);
        form.resetFields();
        form.setFieldsValue({
            is_available: true,
            sort_order: 0,
            price: 0,
            categoryId: activeCat && activeCat !== "_uncat" ? activeCat : null,
        });
        setOpen(true);
    };

    const openEdit = (row: Item) => {
        setEditing(row);
        setImageFile(null);
        setFileList(
            row.image_url
                ? [{ uid: "current", name: "image", status: "done", url: row.image_url } as UploadFile]
                : []
        );
        form.setFieldsValue({
            categoryId: row.categoryId ?? null,
            name: row.name,
            description: row.description ?? "",
            price: row.price,
            is_available: row.is_available,
            sort_order: row.sort_order,
        });
        setOpen(true);
    };

    const submit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const fd = new FormData();
            if (values.categoryId !== undefined) fd.append("categoryId", values.categoryId ?? "");
            fd.append("name", values.name ?? "");
            fd.append("description", values.description ?? "");
            fd.append("price", String(values.price ?? 0));
            fd.append("sort_order", String(values.sort_order ?? 0));
            fd.append("is_available", String(!!values.is_available));
            if (imageFile) fd.append("image", imageFile);

            if (editing) {
                await MenuAPI.updateItem(editing._id, fd);
                message.success("Yangilandi");
            } else {
                await MenuAPI.createItem(restaurantId, fd);
                message.success("Yaratildi");
            }

            setOpen(false);
            setEditing(null);
            setImageFile(null);
            setFileList([]);
            form.resetFields();
            loadItems();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e?.response?.data?.message ?? "Saqlash muvaffaqiyatsiz");
        } finally {
            setSaving(false);
        }
    };

    const toggleAvailability = async (row: Item, next: boolean) => {
        // optimistic update
        setItems((prev) => prev.map((it) => (it._id === row._id ? { ...it, is_available: next } : it)));
        try {
            const fd = new FormData();
            fd.append("is_available", String(next));
            await MenuAPI.updateItem(row._id, fd);
        } catch (e: any) {
            // revert on failure
            setItems((prev) => prev.map((it) => (it._id === row._id ? { ...it, is_available: !next } : it)));
            message.error(e?.response?.data?.message ?? "Yangilash muvaffaqiyatsiz");
        }
    };

    const deleteItem = async (row: Item) => {
        try {
            await MenuAPI.deleteItem(row._id);
            message.success("O'chirildi");
            loadItems();
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "O'chirish muvaffaqiyatsiz");
        }
    };

    const tabBaseClass =
        "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition cursor-pointer select-none";

    return (
        <>
            {/* Category tab strip */}
            <div className="overflow-x-auto" style={{ marginBottom: 16, marginInline: -8 }}>
                <div style={{ display: "flex", gap: 8, padding: "4px 8px", flexWrap: "nowrap" }}>
                    <span
                        className={tabBaseClass}
                        style={
                            activeCat == null
                                ? { background: "#09090b", color: "#fff", borderColor: "#09090b" }
                                : { background: "#fff", color: "#3f3f46", borderColor: "#e4e4e7" }
                        }
                        onClick={() => setActiveCat(null)}
                    >
                        Barchasi
                    </span>
                    {categories.map((c) => (
                        <span
                            key={c._id}
                            className={tabBaseClass}
                            style={
                                activeCat === c._id
                                    ? { background: "#09090b", color: "#fff", borderColor: "#09090b" }
                                    : { background: "#fff", color: "#3f3f46", borderColor: "#e4e4e7" }
                            }
                            onClick={() => setActiveCat(c._id)}
                        >
                            {c.name}
                        </span>
                    ))}
                    <span
                        className={tabBaseClass}
                        style={
                            activeCat === "_uncat"
                                ? { background: "#09090b", color: "#fff", borderColor: "#09090b" }
                                : { background: "#fff", color: "#71717a", borderColor: "#e4e4e7" }
                        }
                        onClick={() => setActiveCat("_uncat")}
                    >
                        Kategoriyasiz
                    </span>
                </div>
            </div>

            {/* Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 20,
                }}
            >
                {visibleItems.map((it) => {
                    const cat = categories.find((c) => c._id === it.categoryId);
                    return (
                        <div
                            key={it._id}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                cursor: "pointer",
                                position: "relative",
                            }}
                            onClick={() => openEdit(it)}
                            className="menu-card"
                        >
                            {/* Image */}
                            <div
                                style={{
                                    position: "relative",
                                    aspectRatio: "1 / 1",
                                    background: "#f4f4f5",
                                    borderRadius: 16,
                                    overflow: "hidden",
                                    opacity: it.is_available ? 1 : 0.55,
                                }}
                            >
                                {it.image_url ? (
                                    <img
                                        src={it.image_url}
                                        alt={it.name}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 36,
                                            color: "#d4d4d8",
                                        }}
                                    >
                                        🍽
                                    </div>
                                )}

                                {/* Top-right: actions */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        display: "flex",
                                        gap: 6,
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Tooltip title="Modifikatorlar">
                                        <Button
                                            shape="circle"
                                            size="small"
                                            icon={<SettingOutlined />}
                                            onClick={() => setSelectedItem(it)}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Tahrirlash">
                                        <Button
                                            shape="circle"
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={() => openEdit(it)}
                                        />
                                    </Tooltip>
                                    <Popconfirm
                                        title="O'chirasizmi?"
                                        okText="O'chirish"
                                        okButtonProps={{ danger: true }}
                                        onConfirm={() => deleteItem(it)}
                                    >
                                        <Button
                                            shape="circle"
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                        />
                                    </Popconfirm>
                                </div>

                                {/* Top-left: availability switch */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 8,
                                        left: 8,
                                        background: "rgba(255,255,255,0.95)",
                                        borderRadius: 999,
                                        padding: "2px 8px 2px 6px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Switch
                                        size="small"
                                        checked={it.is_available}
                                        onChange={(v) => toggleAvailability(it, v)}
                                    />
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#3f3f46" }}>
                                        {it.is_available ? "Bor" : "Yo'q"}
                                    </span>
                                </div>
                            </div>

                            {/* Text */}
                            <div style={{ paddingInline: 4, paddingTop: 10 }}>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                                    <span style={{ fontWeight: 800, fontSize: 17, lineHeight: 1 }}>
                                        {fmtSum(it.price)}
                                    </span>
                                    <span style={{ fontSize: 13, color: "#71717a" }}>so'm</span>
                                </div>
                                <div
                                    style={{
                                        marginTop: 4,
                                        fontWeight: 500,
                                        fontSize: 14,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {it.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#71717a",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        marginTop: 2,
                                    }}
                                >
                                    {it.description?.trim() || "—"}
                                </div>
                                {!activeCat && cat && (
                                    <Tag style={{ marginTop: 6 }}>{cat.name}</Tag>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Add new card */}
                <button
                    onClick={openAdd}
                    style={{
                        aspectRatio: "1 / 1",
                        border: "2px dashed #d4d4d8",
                        borderRadius: 16,
                        background: "#fafafa",
                        color: "#71717a",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontWeight: 600,
                    }}
                    className="menu-add-card"
                >
                    <PlusOutlined style={{ fontSize: 24 }} />
                    <span>Mahsulot qo'shish</span>
                </button>
            </div>

            {!loading && visibleItems.length === 0 && (
                <div style={{ textAlign: "center", padding: 24, color: "#71717a" }}>
                    Bu kategoriyada mahsulot yo'q. Yuqoridagi karta orqali qo'shing.
                </div>
            )}

            {/* Edit / Create modal */}
            <Modal
                title={editing ? "Mahsulotni tahrirlash" : "Mahsulot qo'shish"}
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setEditing(null);
                    setImageFile(null);
                    setFileList([]);
                }}
                onOk={submit}
                confirmLoading={saving}
                okText={editing ? "Saqlash" : "Yaratish"}
                cancelText="Bekor qilish"
                width={520}
            >
                <Form form={form} layout="vertical" initialValues={{ is_available: true, sort_order: 0 }}>
                    <Form.Item label="Rasm">
                        <Upload
                            accept="image/*"
                            maxCount={1}
                            listType="picture-card"
                            fileList={fileList}
                            beforeUpload={(file) => {
                                setImageFile(file);
                                setFileList([
                                    {
                                        uid: file.uid ?? String(Date.now()),
                                        name: file.name,
                                        status: "done",
                                        originFileObj: file,
                                    },
                                ]);
                                return false;
                            }}
                            onRemove={() => {
                                setImageFile(null);
                                setFileList([]);
                            }}
                        >
                            {fileList.length === 0 && (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Yuklash</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item name="categoryId" label="Kategoriya">
                        <Select allowClear placeholder="Tanlang" options={categoryOptions} />
                    </Form.Item>

                    <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
                        <Input placeholder="Masalan: Shaurmitta L" />
                    </Form.Item>

                    <Form.Item name="description" label="Tavsif">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item name="price" label="Narx (so'm)" rules={[{ required: true }]}>
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                            parser={(v) => Number((v ?? "").toString().replace(/\s+/g, "")) as any}
                        />
                    </Form.Item>

                    <Form.Item name="sort_order" label="Tartib raqami">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="is_available" label="Mavjud" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            <ModifiersDrawer
                open={!!selectedItem}
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
            />

            <style>{`
                .menu-card:hover { transform: translateY(-2px); transition: transform 0.15s; }
                .menu-add-card:hover { background: #f4f4f5; border-color: #a1a1aa; color: #3f3f46; }
            `}</style>
        </>
    );
}
