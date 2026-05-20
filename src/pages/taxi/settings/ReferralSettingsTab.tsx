import { Button, Card, Form, InputNumber, message, Skeleton, Spin, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { GoogleMap, Polygon, useJsApiLoader } from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";
import { ReferralAPI, type LatLng } from "../../../api/referral";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
const GMAPS_LIBRARIES: Libraries = ["drawing"];
const DEFAULT_CENTER = { lat: 41.1, lng: 71.15 };
const POLYGON_OPTIONS = {
    fillColor: "#f5222d",
    fillOpacity: 0.15,
    strokeColor: "#f5222d",
    strokeWeight: 2,
    editable: true,
    draggable: false,
};

const { Text } = Typography;

type DriverFormValues = { driverReferralBonus: number };
type PassengerFormValues = { passengerReferralBonus: number };
type PassengerToPassengerFormValues = { passengerToPassengerReferralBonus: number };
type RegistrationBonusFormValues = { driverRegistrationBonus: number };

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
    const [savingPassengerToPassenger, setSavingPassengerToPassenger] = useState(false);
    const [savingZone, setSavingZone] = useState(false);
    const [savingRegistration, setSavingRegistration] = useState(false);

    const [polygon, setPolygon] = useState<LatLng[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const polygonRef = useRef<google.maps.Polygon | null>(null);

    const { isLoaded: mapsLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GMAPS_LIBRARIES,
    });

    const [driverForm] = Form.useForm<DriverFormValues>();
    const [passengerForm] = Form.useForm<PassengerFormValues>();
    const [passengerToPassengerForm] = Form.useForm<PassengerToPassengerFormValues>();
    const [registrationBonusForm] = Form.useForm<RegistrationBonusFormValues>();

    const load = async () => {
        setLoading(true);
        try {
            const [settings, zone, registrationBonus, p2pBonus] = await Promise.all([
                ReferralAPI.getSettings(),
                ReferralAPI.getZone(),
                ReferralAPI.getRegistrationBonus(),
                ReferralAPI.getPassengerToPassengerBonus(),
            ]);
            driverForm.setFieldsValue({ driverReferralBonus: settings.driverReferralBonus });
            passengerForm.setFieldsValue({ passengerReferralBonus: settings.passengerReferralBonus });
            passengerToPassengerForm.setFieldsValue({
                passengerToPassengerReferralBonus: p2pBonus.passengerToPassengerReferralBonus,
            });
            setPolygon(zone.polygon ?? []);
            registrationBonusForm.setFieldsValue({ driverRegistrationBonus: registrationBonus.driverRegistrationBonus });
        } catch {
            message.error("Referral sozlamalarini yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onSaveRegistrationBonus = async (values: RegistrationBonusFormValues) => {
        setSavingRegistration(true);
        try {
            await ReferralAPI.updateRegistrationBonus(values.driverRegistrationBonus);
            message.success("Ro'yxatdan o'tish bonusi yangilandi");
        } catch {
            message.error("Saqlashda xatolik yuz berdi");
        } finally {
            setSavingRegistration(false);
        }
    };

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

    const onSavePassengerToPassenger = async (values: PassengerToPassengerFormValues) => {
        setSavingPassengerToPassenger(true);
        try {
            await ReferralAPI.updatePassengerToPassengerBonus(values.passengerToPassengerReferralBonus);
            message.success("Yo'lovchi → Yo'lovchi referral bonus miqdori yangilandi");
        } catch {
            message.error("Saqlashda xatolik yuz berdi");
        } finally {
            setSavingPassengerToPassenger(false);
        }
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

    const onSaveZone = async () => {
        if (polygon.length > 0 && polygon.length < 3) {
            message.warning("Polygon kamida 3 ta nuqtadan iborat bo'lishi kerak");
            return;
        }
        setSavingZone(true);
        try {
            await ReferralAPI.updateZone({ polygon });
            message.success("Referral hududi yangilandi");
        } catch {
            message.error("Hududni saqlashda xatolik yuz berdi");
        } finally {
            setSavingZone(false);
        }
    };

    return (
        <div style={{ maxWidth: 520 }}>
            {/* Registration bonus */}
            <Card title="Yangi haydovchi ro'yxatdan o'tish bonusi" style={{ marginBottom: 24 }}>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Yangi haydovchining hujjatlari admin tomonidan tasdiqlanganida
                    uning asosiy balansiga avtomatik qo'shiladigan bonus miqdori.
                    0 ga o'rnating — bu bonusni o'chiradi.
                </Text>

                {loading ? (
                    <Skeleton active paragraph={{ rows: 2 }} />
                ) : (
                    <Form form={registrationBonusForm} layout="vertical" onFinish={onSaveRegistrationBonus}>
                        <Form.Item
                            name="driverRegistrationBonus"
                            label="Ro'yxatdan o'tish bonusi (UZS)"
                            rules={[
                                { required: true, message: "Iltimos, miqdorni kiriting" },
                                { type: "number", min: 0, message: "Miqdor 0 dan kam bo'lmasligi kerak" },
                            ]}
                        >
                            <InputNumber {...numberFieldProps} placeholder="Masalan: 30000" />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button type="primary" htmlType="submit" loading={savingRegistration}>
                                Saqlash
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Card>

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

            {/* Passenger → Passenger referral */}
            <Card title="Yo'lovchi → Yo'lovchi referral tizimi" style={{ marginBottom: 24 }}>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Yo'lovchi o'zining referral kodini boshqa yo'lovchiga ulashadi.
                    Yangi yo'lovchi shu kod orqali ro'yxatdan o'tganda taklif qiluvchi
                    yo'lovchiga bonus <strong>darhol</strong> uning balansiga qo'shiladi.
                    0 ga o'rnating — bu bonusni o'chiradi.
                </Text>

                {loading ? (
                    <Skeleton active paragraph={{ rows: 2 }} />
                ) : (
                    <Form form={passengerToPassengerForm} layout="vertical" onFinish={onSavePassengerToPassenger}>
                        <Form.Item
                            name="passengerToPassengerReferralBonus"
                            label="Yo'lovchi referral bonus miqdori (UZS)"
                            rules={[
                                { required: true, message: "Iltimos, miqdorni kiriting" },
                                { type: "number", min: 0, message: "Miqdor 0 dan kam bo'lmasligi kerak" },
                            ]}
                        >
                            <InputNumber {...numberFieldProps} placeholder="Masalan: 10000" />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button type="primary" htmlType="submit" loading={savingPassengerToPassenger}>
                                Saqlash
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Card>

            {/* Referral zone */}
            <Card title="Referral hududi" style={{ marginBottom: 24 }}>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Xaritada polygon chizing. Yangi foydalanuvchi joylashuvi shu polygon ichida
                    bo'lsa referral <strong>avtomatik tasdiqlanadi</strong>, tashqarida bo'lsa
                    <strong> avtomatik rad etiladi</strong>. Polygon bo'sh bo'lsa cheklov
                    o'chadi — har qanday joylashuv tasdiqlanadi.
                </Text>

                {loading ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                ) : (
                    <>
                        <div style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
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
                            <Text type="secondary">{polygon.length} ta nuqta</Text>
                        </div>

                        {mapsLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: 380, borderRadius: 8 }}
                                center={
                                    polygon.length > 0
                                        ? polygon.reduce(
                                            (acc, p) => ({
                                                lat: acc.lat + p.lat / polygon.length,
                                                lng: acc.lng + p.lng / polygon.length,
                                            }),
                                            { lat: 0, lng: 0 }
                                        )
                                        : DEFAULT_CENTER
                                }
                                zoom={10}
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
                            <div
                                style={{
                                    width: "100%",
                                    height: 380,
                                    borderRadius: 8,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "#f5f5f5",
                                }}
                            >
                                <Spin />
                            </div>
                        )}

                        {isDrawing && (
                            <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                                Xaritaga bosib polygon nuqtalarini belgilang. Kamida 3 ta nuqta kerak.
                            </Text>
                        )}

                        <div style={{ marginTop: 12 }}>
                            <Button type="primary" loading={savingZone} onClick={onSaveZone}>
                                Saqlash
                            </Button>
                        </div>
                    </>
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
                                "Yangi haydovchi joylashuvi qabul qilinadi va referral polygoniga ko'ra avtomatik tekshiriladi",
                                "Polygon ichida bo'lsa — taklif qiluvchi haydovchiga bonus avtomatik o'tkaziladi; admin \"Referrallar\" bo'limida qo'lda bekor qilishi yoki qayta tasdiqlashi mumkin",
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
                                "Yo'lovchi joylashuvi qabul qilinadi va referral polygoniga ko'ra avtomatik tekshiriladi",
                                "Polygon ichida bo'lsa — haydovchiga bonus avtomatik o'tkaziladi; admin \"Referrallar\" bo'limida qo'lda bekor qilishi yoki qayta tasdiqlashi mumkin",
                            ].map((step, i) => (
                                <StepRow key={i} index={i + 1} text={step} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <Text strong>Yo'lovchi → Yo'lovchi:</Text>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                            {[
                                "Yo'lovchi profilida o'zining referral kodini ko'radi",
                                "Kodni do'stiga ulashadi (nusxa olish yoki messenjer orqali)",
                                "Do'st shu kod bilan ilovaga ro'yxatdan o'tadi",
                                "Taklif qiluvchi yo'lovchi balansiga bonus darhol qo'shiladi — admin tasdig'isiz",
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
