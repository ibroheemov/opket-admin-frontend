import { Button, Card, Form, Input, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { AuthLayout } from "../../layouts/AuthLayout";
import { AuthAPI } from "../../api/endpoints";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [msg, contextHolder] = message.useMessage();

    const onFinish = async (values: { email: string; password: string }) => {
        try {
            const res = await AuthAPI.login(values);
            login(res.token);

            msg.success("Tizimga kirildi!");
            navigate("/app/dashboard", { replace: true });
        } catch (e: any) {
            msg.error(e?.response?.data?.message ?? "Kirish muvaffaqiyatsiz");
        }
    };

    return (
        <AuthLayout>
            {contextHolder}
            <Card style={{ width: 380 }}>
                <Typography.Title level={3} style={{ marginTop: 0 }}>
                    Opket Admin
                </Typography.Title>

                <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                    <Form.Item
                        label="Telefon raqam"
                        name="phone"
                        rules={[{ required: true, message: "Telefon raqam majburiy" }]}
                    >
                        <Input placeholder="991235678" />
                    </Form.Item>

                    <Form.Item label="Parol" name="password" rules={[{ required: true, message: "Parol majburiy" }]}>
                        <Input.Password placeholder="••••••••" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>
                        Kirish
                    </Button>
                </Form>
            </Card>
        </AuthLayout>
    );
}
