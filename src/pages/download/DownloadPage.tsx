import { useEffect, useRef, useState } from "react";

type Platform = "ios" | "android" | "unknown";

const ANDROID_PACKAGE = "com.saabiqoon.tasbeeh";
const IOS_APP_URL = "https://apps.apple.com/us/app/opket-taxi/id6759873649";

function detectPlatform(): Platform {
    const ua = navigator.userAgent || navigator.vendor;
    if (/iPad|iPhone|iPod/.test(ua)) return "ios";
    if (/Macintosh/.test(ua) && "ontouchend" in document) return "ios";
    if (/android/i.test(ua)) return "android";
    return "unknown";
}

function buildStoreUrl(platform: Platform, refCode: string | null): string {
    if (platform === "ios") return IOS_APP_URL;
    const base = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
    if (refCode) return `${base}&referrer=${encodeURIComponent(`ref=${refCode}`)}`;
    return base;
}

export default function DownloadPage() {
    const [platform, setPlatform] = useState<Platform | null>(null);
    const [refCode, setRefCode] = useState<string | null>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);
    const didRedirect = useRef(false);

    useEffect(() => {
        const ref = new URLSearchParams(window.location.search).get("ref");
        setRefCode(ref);

        if (didRedirect.current) return;
        didRedirect.current = true;

        const detected = detectPlatform();
        setPlatform(detected);

        if (detected === "ios") return;

        const url = buildStoreUrl(detected, ref);
        window.location.replace(url);

        const t1 = window.setTimeout(() => window.location.assign(url), 300);
        const t2 = window.setTimeout(() => linkRef.current?.click(), 800);

        return () => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, []);

    const androidUrl = buildStoreUrl("android", refCode);
    const redirectUrl = platform ? buildStoreUrl(platform, refCode) : androidUrl;

    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            padding: "0 24px",
            textAlign: "center",
        }}>
            <a ref={linkRef} href={redirectUrl} style={{ display: "none" }} aria-hidden="true">redirect</a>

            <div style={{ marginBottom: 32 }}>
                <img
                    src="/logo/logo.jpg"
                    alt="Opket"
                    style={{
                        margin: "0 auto 16px",
                        height: 80,
                        width: 80,
                        borderRadius: 16,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        objectFit: "cover",
                        display: "block",
                    }}
                />
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Opket</h1>
            </div>

            {refCode && platform !== "android" && (
                <div style={{
                    marginBottom: 24,
                    borderRadius: 16,
                    border: "2px dashed #4ade80",
                    backgroundColor: "#f0fdf4",
                    padding: "16px 32px",
                }}>
                    <p style={{ marginBottom: 4, fontSize: 14, color: "#6b7280" }}>Referral kodingiz</p>
                    <p style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.2em", color: "#15803d", margin: "0 0 8px" }}>
                        {refCode}
                    </p>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                        Ilovani yuklab olgach, ro'yxatdan o'tishda shu kodni kiriting
                    </p>
                </div>
            )}

            {platform === "android" && (
                <div>
                    <div style={{
                        margin: "0 auto 16px",
                        height: 32,
                        width: 32,
                        borderRadius: "50%",
                        border: "3px solid #e5e7eb",
                        borderTopColor: "#1f2937",
                        animation: "spin 0.8s linear infinite",
                    }} />
                    <p style={{ color: "#6b7280" }}>Play Store'ga yo'naltirilmoqda…</p>
                    <a href={androidUrl} style={{ marginTop: 16, display: "inline-block", fontSize: 14, fontWeight: 500, color: "#2563eb", textDecoration: "underline" }}>
                        Avtomatik o'tmasa, bu yerni bosing
                    </a>
                </div>
            )}

            {platform === "ios" && (
                <div>
                    <a
                        href={IOS_APP_URL}
                        style={{
                            display: "inline-block",
                            borderRadius: 12,
                            backgroundColor: "#000000",
                            padding: "12px 32px",
                            fontWeight: 500,
                            color: "#ffffff",
                            textDecoration: "none",
                        }}
                    >
                        App Store'dan yuklab olish
                    </a>
                </div>
            )}

            {platform === "unknown" && (
                <div>
                    <p style={{ color: "#4b5563", marginBottom: 12 }}>Platformangizni tanlang:</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <a
                            href={IOS_APP_URL}
                            style={{
                                borderRadius: 12,
                                backgroundColor: "#000000",
                                padding: "12px 24px",
                                fontWeight: 500,
                                color: "#ffffff",
                                textDecoration: "none",
                            }}
                        >
                            iOS uchun yuklab olish
                        </a>
                        <a
                            href={androidUrl}
                            style={{
                                borderRadius: 12,
                                backgroundColor: "#16a34a",
                                padding: "12px 24px",
                                fontWeight: 500,
                                color: "#ffffff",
                                textDecoration: "none",
                            }}
                        >
                            Android uchun yuklab olish
                        </a>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
