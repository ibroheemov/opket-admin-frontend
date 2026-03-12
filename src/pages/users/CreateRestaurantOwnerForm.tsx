import { useState } from "react";
import { Button, Form, Input, Space, message } from "antd";
import { RestaurantOwnersAPI, type CreateRestaurantOwnerPayload } from "../../api/restaurant-owners";


type Props = {
    onSuccess?: () => void;
    onCancel?: () => void;
};

type FormValues = {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    passwordConfirm: string;
};

export default function CreateRestaurantOwnerForm({
    onSuccess,
    onCancel,
}: Props) {
    const [form] = Form.useForm<FormValues>();
    const [submitting, setSubmitting] = useState(false);
    const [msg, contextHolder] = message.useMessage();

    const submit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const payload: CreateRestaurantOwnerPayload = {
                fullName: values.fullName.trim(),
                email: values.email.trim().toLowerCase(),
                phone: values.phone?.trim() || undefined,
                password: values.password,
                createRestaurant: false,
            };

            await RestaurantOwnersAPI.createRestaurantOwner(payload);

            msg.success("Restoran egasi muvaffaqiyatli yaratildi");

            form.resetFields();
            onSuccess?.();
        } catch (e: any) {
            if (e?.errorFields) return;

            msg.error(
                e?.response?.data?.message ??
                e?.message ??
                "Restoran egasini yaratishda xatolik"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {contextHolder}

            <Form layout="vertical" form={form}>
                <Form.Item
                    name="fullName"
                    label="To'liq ism"
                    rules={[
                        { required: true, message: "To'liq ism majburiy" },
                        { min: 2, message: "Juda qisqa" },
                    ]}
                >
                    <Input placeholder="Ali Karimov" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Email majburiy" },
                        { type: "email", message: "Noto'g'ri email" },
                    ]}
                >
                    <Input placeholder="egasi@restoran.com" />
                </Form.Item>

                <Form.Item name="phone" label="Telefon (ixtiyoriy)">
                    <Input placeholder="+998901234567" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Parol"
                    hasFeedback
                    rules={[
                        { required: true, message: "Parol majburiy" },
                        { min: 8, message: "Kamida 8 ta belgi" },
                    ]}
                >
                    <Input.Password placeholder="Kamida 8 ta belgi" />
                </Form.Item>

                <Form.Item
                    name="passwordConfirm"
                    label="Parolni tasdiqlang"
                    dependencies={["password"]}
                    hasFeedback
                    rules={[
                        { required: true, message: "Parolni tasdiqlang" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const p = getFieldValue("password");
                                if (!value || value === p) return Promise.resolve();
                                return Promise.reject(
                                    new Error("Parollar mos kelmaydi")
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Parolni qaytaring" />
                </Form.Item>

                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    {onCancel && (
                        <Button onClick={onCancel} disabled={submitting}>
                            Bekor qilish
                        </Button>
                    )}
                    <Button type="primary" onClick={submit} loading={submitting}>
                        Yaratish
                    </Button>
                </Space>
            </Form>
        </>
    );
}
