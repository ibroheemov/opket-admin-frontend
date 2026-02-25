import { Button, Form, message } from "antd";
import { api } from "../../../api/client";
import type { UploadFile } from "antd/es/upload/interface";
import { RestaurantForm, type RestaurantFormValues } from "../RestaurantForm";
import React from "react";
import { buildRestaurantFormData } from "../utils/restaurantPayload";
import { restaurantToFormValues } from "../utils/restaurantToFormValues";
import type { Restaurant } from "../../../types/restaurant";


export function EditRestaurantPage({ restaurantId }: { restaurantId: string }) {
    const [form] = Form.useForm<RestaurantFormValues>();
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    const [logoFileList, setLogoFileList] = React.useState<UploadFile[]>([]);
    const [bannerFileList, setBannerFileList] = React.useState<UploadFile[]>([]);
    const [galleryFileList, setGalleryFileList] = React.useState<UploadFile[]>([]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get<{ success: boolean; restaurant: Restaurant }>(`/restaurants/${restaurantId}`);
            const r = res.data.restaurant;

            form.setFieldsValue(restaurantToFormValues(r) as any);

            // prefill uploads from URLs if you have them
            setLogoFileList(r.logo_url ? [uploadFileFromUrl(r.logo_url, "logo")] : []);
            setBannerFileList(r.banner_url ? [uploadFileFromUrl(r.banner_url, "banner")] : []);
            setGalleryFileList(
                (r.gallery_urls ?? []).map((u: string, i: number) => uploadFileFromUrl(u, `gallery-${i + 1}`))
            );
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Failed to load restaurant");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId]);

    const onFinish = async (values: RestaurantFormValues) => {
        setSaving(true);
        try {
            const logoFile = logoFileList?.[0]?.originFileObj as File | undefined;
            const bannerFile = bannerFileList?.[0]?.originFileObj as File | undefined;
            const galleryFiles = (galleryFileList ?? [])
                .map((f) => f.originFileObj as File | undefined)
                .filter(Boolean) as File[];

            const fd = buildRestaurantFormData(values, { logoFile, bannerFile, galleryFiles });

            await api.patch(`/restaurants/${restaurantId}`, fd);
            message.success("Saved");
            await load();
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Save failed");
        } finally {
            setSaving(false);
        }
    };

    function uploadFileFromUrl(url: string, name: string): UploadFile {
        return { uid: url, name, status: "done", url };
    }

    return (
        <RestaurantForm
            form={form}
            disabled={loading}
            title="Edit restaurant"
            showStatusField={true}
            logoFileList={logoFileList}
            setLogoFileList={setLogoFileList}
            bannerFileList={bannerFileList}
            setBannerFileList={setBannerFileList}
            galleryFileList={galleryFileList}
            setGalleryFileList={setGalleryFileList}
            onFinish={onFinish}
            footer={
                <Button type="primary" htmlType="submit" loading={saving} >
                    Save
                </Button>
            }
        />
    );
}