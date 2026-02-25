// import { Button, Form, Input, Modal, Space, Switch, Table, Typography, Upload, message } from "antd";
// import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../../api/client";
// import type { UploadFile } from "antd/es/upload/interface";

// export type Restaurant = {
//     _id: string;
//     name: string;
//     phone: string;
//     address_line1: string;
//     address_line2?: string;
//     city: string;
//     region: string;
//     postal_code?: string;
//     lat?: number | null;
//     lng?: number | null;
//     is_open: boolean;
//     min_order_amount?: number | null;
//     delivery_fee_base?: number | null;
//     createdAt?: string;
//     updatedAt?: string;
//     banner_url?: string | null;
//     password?: string;
// };

// type ListResponse = {
//     success: boolean;
//     restaurants: Restaurant[];
//     meta?: { page: number; pageSize: number; total: number; totalPages: number };
// };

// export default function RestaurantsPage() {
//     const nav = useNavigate();
//     const [msg, contextHolder] = message.useMessage();
//     const [bannerFileList, setBannerFileList] = useState<UploadFile[]>([]);

//     const [data, setData] = useState<Restaurant[]>([]);
//     const [loading, setLoading] = useState(false);

//     // server-side table state
//     const [page, setPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10);
//     const [total, setTotal] = useState(0);

//     // search
//     const [q, setQ] = useState("");

//     // create modal
//     const [open, setOpen] = useState(false);
//     const [creating, setCreating] = useState(false);
//     const [form] = Form.useForm<Partial<Restaurant>>();

//     const load = async () => {
//         setLoading(true);
//         try {
//             const res = await api.get<ListResponse>("/restaurants", {
//                 params: { page, pageSize, q: q.trim() || undefined },
//             });

//             setData(res.data.restaurants ?? []);
//             setTotal(res.data.meta?.total ?? (res.data.restaurants?.length ?? 0));
//         } catch (e: any) {
//             msg.error(e?.response?.data?.message ?? "Failed to load restaurants");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         load();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [page, pageSize]);

//     const columns: ColumnsType<Restaurant> = [
//         { title: "Name", dataIndex: "name" },
//         { title: "Phone", dataIndex: "phone", width: 140 },
//         {
//             title: "City",
//             dataIndex: "city",
//             width: 140,
//             render: (_, r) => `${r.city}, ${r.region}`,
//         },
//         {
//             title: "Open",
//             dataIndex: "is_open",
//             width: 90,
//             render: (v) => (v ? "Yes" : "No"),
//         },
//         {
//             title: "",
//             width: 100,
//             render: (_, r) => (
//                 <Button type="link" onClick={() => nav(`/app/restaurants/${r._id}`)}>
//                     Manage
//                 </Button>
//             ),
//         },
//     ];

//     const pagination: TablePaginationConfig = {
//         current: page,
//         pageSize,
//         total,
//         showSizeChanger: true,
//         onChange: (p, ps) => {
//             setPage(p);
//             if (ps && ps !== pageSize) {
//                 setPageSize(ps);
//                 setPage(1);
//             }
//         },
//     };

//     const createRestaurant = async () => {
//         try {
//             const values = await form.validateFields();
//             setCreating(true);

//             const fd = new FormData();

//             // append fields (multipart => strings)
//             fd.append("name", values.name ?? "");
//             fd.append("phone", values.phone ?? "");
//             fd.append("address_line1", values.address_line1 ?? "");
//             fd.append("address_line2", values.address_line2 ?? "");
//             fd.append("city", values.city ?? "");
//             fd.append("region", values.region ?? "");
//             fd.append("postal_code", values.postal_code ?? "");
//             fd.append("is_open", String(!!values.is_open));
//             fd.append("password", values.password ?? "");

//             // append banner file if provided
//             const bannerFile = bannerFileList?.[0]?.originFileObj as File | undefined;
//             if (bannerFile) {
//                 fd.append("banner", bannerFile); // ✅ must match backend field name upload.single("banner")
//             }

//             await api.post("/restaurants", fd);

//             msg.success("Restaurant created");
//             setOpen(false);
//             form.resetFields();
//             setBannerFileList([]); // ✅ clear upload

//             setPage(1);
//             await load();
//         } catch (e: any) {
//             if (e?.errorFields) return;
//             msg.error(e?.response?.data?.message ?? "Create failed");
//         } finally {
//             setCreating(false);
//         }
//     };

//     return (
//         <Space direction="vertical" size="middle" style={{ width: "100%" }}>
//             {contextHolder}

//             <Space style={{ width: "100%", justifyContent: "space-between" }}>
//                 <Typography.Title level={2} style={{ margin: 0 }}>
//                     Restaurants
//                 </Typography.Title>

//                 <Space>
//                     <Input.Search
//                         placeholder="Search name / phone / city..."
//                         allowClear
//                         value={q}
//                         onChange={(e) => setQ(e.target.value)}
//                         onSearch={() => {
//                             setPage(1);
//                             load();
//                         }}
//                         style={{ width: 320 }}
//                     />
//                     <Button onClick={load} loading={loading}>
//                         Refresh
//                     </Button>
//                     <Button type="primary" onClick={() => setOpen(true)}>
//                         Create
//                     </Button>
//                 </Space>
//             </Space>

//             <Table<Restaurant>
//                 rowKey="_id"
//                 loading={loading}
//                 dataSource={data}
//                 columns={columns}
//                 pagination={pagination}
//             />

//             <Modal
//                 title="Create Restaurant"
//                 open={open}
//                 onCancel={() => {
//                     setOpen(false);
//                     form.resetFields();
//                     setBannerFileList([]);
//                 }}
//                 onOk={createRestaurant}
//                 okText="Create"
//                 confirmLoading={creating}
//             >
//                 <Form form={form} layout="vertical" initialValues={{ is_open: true }}>
//                     <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
//                         <Input />
//                     </Form.Item>

//                     <Form.Item name="phone" label="Phone" rules={[{ required: true, message: "Phone is required" }]}>
//                         <Input />
//                     </Form.Item>

//                     <Form.Item
//                         name="password"
//                         label="Password"
//                         rules={[
//                             { required: true, message: "Password is required" },
//                             { min: 8, message: "Minimum 8 characters" },
//                         ]}
//                         hasFeedback
//                     >
//                         <Input.Password />
//                     </Form.Item>

//                     <Form.Item
//                         name="passwordConfirm"
//                         label="Confirm password"
//                         dependencies={["password"]}
//                         hasFeedback
//                         rules={[
//                             { required: true, message: "Please confirm password" },
//                             ({ getFieldValue }) => ({
//                                 validator(_, value) {
//                                     const p = getFieldValue("password");
//                                     if (!value || value === p) return Promise.resolve();
//                                     return Promise.reject(new Error("Passwords do not match"));
//                                 },
//                             }),
//                         ]}
//                     >
//                         <Input.Password />
//                     </Form.Item>

//                     <Form.Item
//                         name="address_line1"
//                         label="Address line 1"
//                         rules={[{ required: true, message: "Address line 1 is required" }]}
//                     >
//                         <Input />
//                     </Form.Item>

//                     <Form.Item label="Company banner">
//                         <Upload
//                             accept="image/*"
//                             listType="picture"
//                             maxCount={1}
//                             fileList={bannerFileList}
//                             beforeUpload={() => false} // ✅ prevent auto-upload
//                             onChange={({ fileList }) => setBannerFileList(fileList)}
//                             onRemove={() => {
//                                 setBannerFileList([]);
//                                 return true;
//                             }}
//                         >
//                             <Button>Upload banner</Button>
//                         </Upload>
//                     </Form.Item>

//                     <Form.Item name="address_line2" label="Address line 2">
//                         <Input />
//                     </Form.Item>

//                     <Space style={{ display: "flex" }} size="middle">
//                         <Form.Item name="city" label="City" style={{ flex: 1 }} rules={[{ required: true }]}>
//                             <Input />
//                         </Form.Item>
//                         <Form.Item name="region" label="Region" style={{ flex: 1 }} rules={[{ required: true }]}>
//                             <Input />
//                         </Form.Item>
//                     </Space>

//                     <Form.Item name="postal_code" label="Postal code">
//                         <Input />
//                     </Form.Item>

//                     <Form.Item name="is_open" label="Open (manual override)" valuePropName="checked">
//                         <Switch />
//                     </Form.Item>
//                 </Form>
//             </Modal>
//         </Space>
//     );
// }