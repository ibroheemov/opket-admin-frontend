import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Flex, Spin, Tag, Typography, message } from "antd";
import { ReloadOutlined, CarOutlined } from "@ant-design/icons";
import {
    GoogleMap,
    useJsApiLoader,
    MarkerF,
    InfoWindowF,
} from "@react-google-maps/api";
import { type OnlineDriver, OnlineDriversAPI, type Driver } from "../../api/endpoints";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

const MAP_CONTAINER: React.CSSProperties = {
    width: "100%",
    height: "calc(100vh - 220px)",
    borderRadius: 8,
};

const DEFAULT_CENTER = { lat: 39.65, lng: 66.96 };
const DEFAULT_ZOOM = 12;

function driverLabel(d: OnlineDriver): string {
    if (typeof d.driverId === "object" && d.driverId !== null) {
        const driver = d.driverId as Driver;
        return driver.name || `${driver.firstname ?? ""} ${driver.lastname ?? ""}`.trim() || driver.phone || "Driver";
    }
    return String(d.driverId).slice(-6);
}

function driverInfo(d: OnlineDriver) {
    if (typeof d.driverId === "object" && d.driverId !== null) {
        return d.driverId as Driver;
    }
    return null;
}

function driverKey(d: OnlineDriver, idx: number) {
    if (typeof d.driverId === "string") return d.driverId;
    return (d.driverId as Driver)?._id ?? String(idx);
}

export default function OnlineDriversMapPage() {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });

    const [drivers, setDrivers] = useState<OnlineDriver[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<OnlineDriver | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const hasFittedBounds = useRef(false);

    const fetchDrivers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await OnlineDriversAPI.list();
            setDrivers(res.drivers);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Online haydovchilarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

    useEffect(() => {
        const interval = setInterval(fetchDrivers, 15000);
        return () => clearInterval(interval);
    }, [fetchDrivers]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || drivers.length === 0 || hasFittedBounds.current) return;

        const bounds = new google.maps.LatLngBounds();
        drivers.forEach((d) => bounds.extend({ lat: d.latitude, lng: d.longitude }));
        map.fitBounds(bounds, 60);
        hasFittedBounds.current = true;
    }, [drivers]);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const info = selectedDriver ? driverInfo(selectedDriver) : null;

    return (
        <Flex vertical gap="middle" style={{ width: "100%" }}>
            <Flex justify="space-between" align="center">
                <Flex align="center" gap={8}>
                    <Typography.Title level={2} style={{ margin: 0 }}>
                        Xarita
                    </Typography.Title>
                    <Tag color="green" icon={<CarOutlined />} style={{ fontSize: 14, padding: "2px 10px" }}>
                        {loading ? "..." : drivers.length} ta online
                    </Tag>
                </Flex>

                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchDrivers}
                    loading={loading}
                >
                    Yangilash
                </Button>
            </Flex>

            {!isLoaded && !loadError && (
                <Flex justify="center" align="center" style={{ height: 400 }}>
                    <Spin size="large">
                        <div style={{ padding: 40, textAlign: "center" }}>Xarita yuklanmoqda...</div>
                    </Spin>
                </Flex>
            )}

            {loadError && (
                <Alert
                    type="warning"
                    showIcon
                    message="Google Maps yuklanmadi"
                    description="Google Cloud Console'da Maps JavaScript API yoqilganligini tekshiring. API yoqilgandan keyin sahifani yangilang (Ctrl+Shift+R)."
                    action={
                        <Button size="small" onClick={() => window.location.reload()}>
                            Sahifani yangilash
                        </Button>
                    }
                />
            )}

            {isLoaded && !loadError && (
                <GoogleMap
                    mapContainerStyle={MAP_CONTAINER}
                    center={DEFAULT_CENTER}
                    zoom={DEFAULT_ZOOM}
                    onLoad={onMapLoad}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                    }}
                >
                    {drivers.map((d, idx) => (
                        <MarkerF
                            key={driverKey(d, idx)}
                            position={{ lat: d.latitude, lng: d.longitude }}
                            title={driverLabel(d)}
                            onClick={() => setSelectedDriver(d)}
                        />
                    ))}

                    {selectedDriver && (
                        <InfoWindowF
                            position={{
                                lat: selectedDriver.latitude,
                                lng: selectedDriver.longitude,
                            }}
                            onCloseClick={() => setSelectedDriver(null)}
                        >
                            <div style={{ minWidth: 180, padding: 4 }}>
                                {info ? (
                                    <Card size="small" bordered={false} styles={{ body: { padding: 0 } }}>
                                        <Typography.Text strong style={{ fontSize: 14 }}>
                                            {info.name || `${info.firstname ?? ""} ${info.lastname ?? ""}`}
                                        </Typography.Text>
                                        <br />
                                        <Typography.Text type="secondary">{info.phone}</Typography.Text>
                                        <br />
                                        <Typography.Text>
                                            {info.carModel} • {info.carColor} • {info.carNumber}
                                        </Typography.Text>
                                        <br />
                                        <Tag color={info.status === "online" ? "green" : "default"} style={{ marginTop: 4 }}>
                                            {info.status}
                                        </Tag>
                                    </Card>
                                ) : (
                                    <Typography.Text>
                                        ID: {String(driverKey(selectedDriver, 0))}
                                    </Typography.Text>
                                )}
                            </div>
                        </InfoWindowF>
                    )}
                </GoogleMap>
            )}
        </Flex>
    );
}
