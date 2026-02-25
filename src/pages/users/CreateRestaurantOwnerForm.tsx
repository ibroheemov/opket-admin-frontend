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

            msg.success("Restaurant owner created successfully");

            form.resetFields();
            onSuccess?.();
        } catch (e: any) {
            if (e?.errorFields) return; // antd validation errors

            msg.error(
                e?.response?.data?.message ??
                e?.message ??
                "Failed to create restaurant owner"
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
                    label="Full name"
                    rules={[
                        { required: true, message: "Full name is required" },
                        { min: 2, message: "Too short" },
                    ]}
                >
                    <Input placeholder="Ali Karimov" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Email is required" },
                        { type: "email", message: "Invalid email" },
                    ]}
                >
                    <Input placeholder="owner@restaurant.com" />
                </Form.Item>

                <Form.Item name="phone" label="Phone (optional)">
                    <Input placeholder="+998901234567" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    hasFeedback
                    rules={[
                        { required: true, message: "Password is required" },
                        { min: 8, message: "Minimum 8 characters" },
                    ]}
                >
                    <Input.Password placeholder="At least 8 characters" />
                </Form.Item>

                <Form.Item
                    name="passwordConfirm"
                    label="Confirm password"
                    dependencies={["password"]}
                    hasFeedback
                    rules={[
                        { required: true, message: "Please confirm password" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const p = getFieldValue("password");
                                if (!value || value === p) return Promise.resolve();
                                return Promise.reject(
                                    new Error("Passwords do not match")
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Repeat password" />
                </Form.Item>

                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    {onCancel && (
                        <Button onClick={onCancel} disabled={submitting}>
                            Cancel
                        </Button>
                    )}
                    <Button type="primary" onClick={submit} loading={submitting}>
                        Create
                    </Button>
                </Space>
            </Form>
        </>
    );
}