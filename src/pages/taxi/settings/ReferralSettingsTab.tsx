import { Button, Card, Form, InputNumber, message, Skeleton, Typography } from "antd";
import { useEffect, useState } from "react";
import { ReferralAPI } from "../../../api/referral";

const { Text } = Typography;

type DriverFormValues = { driverReferralBonus: number };
type PassengerFormValues = { passengerReferralBonus: number };

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

export default function ReferralSettingsTab() {
    const [loading, setLoading] = useState(true);
    const [savingDriver, setSavingDriver] = useState(false);
    const [savingPassenger, setSavingPassenger] = useState(false);

    const [driverForm] = Form.useForm<DriverFormValues>();
    const [passengerForm] = Form.useForm<PassengerFormValues>();

    const load = async () => {
        setLoading(true);
        try {
            const settings = await ReferralAPI.getSettings();
            driverForm.setFieldsValue({ driverReferralBonus: settings.driverReferralBonus });
            passengerForm.setFieldsValue({ passengerReferralBonus: settings.passengerReferralBonus });
        } catch {
            message.error("Referral sozlamalarini yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onSaveDriver = async (values: DriverFormValues) => {
        setSavingDriver(true);
        try {
            await ReferralAPI.updateDriverBonus(values.driverReferralBonus);
            message.success("Haydovchi referral bonus miqdori yangilandi");
        } catch {
            message.error("Saqlashda xatolik yuz berdi");
        } finally {
            setSavingDriver(false);
        }
    };

    const onSavePassenger = async (values: PassengerFormValues) => {
        setSavingPassenger(true);
        try {
            await ReferralAPI.updatePassengerBonus(values.passengerReferralBonus);
            message.success("Yo'lovchi referral bonus miqdori yangilandi");
        } catch {
            message.error("Saqlashda xatolik yuz berdi");
        } finally {
            setSavingPassenger(false);
        }
    };

    return (
        <div style={{ maxWidth: 520 }}>
            {/* Driver referral */}
            <Card title="Haydovchi referral tizimi" style={{ marginBottom: 24 }}>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Yangi haydovchi hujjatlari tasdiqlanganda uni taklif qilgan haydovchiga
                    qo'shiladigan bonus miqdori. Bu bonus asosiy balansdan alohida saqlanadi
                    va yechib olish mumkin.
                </Text>

                {loading ? (
                    <Skeleton active paragraph={{ rows: 2 }} />
                ) : (
                    <Form form={driverForm} layout="vertical" onFinish={onSaveDriver}>
                        <Form.Item
                            name="driverReferralBonus"
                            label="Haydovchi referral bonus miqdori (UZS)"
                            rules={[
                                { required: true, message: "Iltimos, miqdorni kiriting" },
                                { type: "number", min: 0, message: "Miqdor 0 dan kam bo'lmasligi kerak" },
                            ]}
                        >
                            <InputNumber {...numberFieldProps} placeholder="Masalan: 50000" />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button type="primary" htmlType="submit" loading={savingDriver}>
                                Saqlash
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Card>

            {/* Passenger referral */}
            <Card title="Yo'lovchi referral tizimi" style={{ marginBottom: 24 }}>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Haydovchi QR kod yoki referral kodi orqali yangi yo'lovchi jalb qilganida
                    haydovchiga qo'shiladigan bonus miqdori. Bu bonus haydovchining asosiy
                    balansidan alohida saqlanadi va yechib olish mumkin.
                </Text>

                {loading ? (
                    <Skeleton active paragraph={{ rows: 2 }} />
                ) : (
                    <Form form={passengerForm} layout="vertical" onFinish={onSavePassenger}>
                        <Form.Item
                            name="passengerReferralBonus"
                            label="Yo'lovchi referral bonus miqdori (UZS)"
                            rules={[
                                { required: true, message: "Iltimos, miqdorni kiriting" },
                                { type: "number", min: 0, message: "Miqdor 0 dan kam bo'lmasligi kerak" },
                            ]}
                        >
                            <InputNumber {...numberFieldProps} placeholder="Masalan: 20000" />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button type="primary" htmlType="submit" loading={savingPassenger}>
                                Saqlash
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Card>

            {/* How it works */}
            <Card title="Qanday ishlaydi?" size="small">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <Text strong>Haydovchi → Haydovchi:</Text>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                            {[
                                "Haydovchi o'zining referral kodini boshqa haydovchiga yuboradi",
                                "Yangi haydovchi ro'yxatdan o'tishda kodini kiritadi",
                                "Hujjatlari admin tomonidan tasdiqlanganda referral bonus o'tkaziladi",
                            ].map((step, i) => (
                                <StepRow key={i} index={i + 1} text={step} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <Text strong>Haydovchi → Yo'lovchi:</Text>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                            {[
                                "Haydovchi QR kod yoki referral kodini yo'lovchiga ko'rsatadi",
                                "Yo'lovchi QR kodni skaner qiladi yoki ro'yxatdan o'tishda kodni kiritadi",
                                "Yo'lovchi ilovaga ro'yxatdan o'tganda haydovchiga bonus o'tkaziladi",
                                "Bonus asosiy balansdan alohida saqlanadi",
                            ].map((step, i) => (
                                <StepRow key={i} index={i + 1} text={step} />
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function StepRow({ index, text }: { index: number; text: string }) {
    return (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
                style={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#52c41a",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                }}
            >
                {index}
            </div>
            <Text style={{ lineHeight: "24px" }}>{text}</Text>
        </div>
    );
}
