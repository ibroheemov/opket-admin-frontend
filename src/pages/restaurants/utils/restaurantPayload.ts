import type { RestaurantFormValues } from "../RestaurantForm";

type RestaurantMediaFiles = {
    logoFile?: File;
    bannerFile?: File;
    galleryFiles?: File[];
};

export function buildRestaurantFormData(values: RestaurantFormValues, files: RestaurantMediaFiles) {
    const fd = new FormData();

    // primitives
    if (values.ownerUserId) fd.append("ownerUserId", values.ownerUserId);
    if (values.cuisineTypeId !== undefined) fd.append("cuisineTypeId", values.cuisineTypeId ?? "");

    fd.append("status", values.status);

    fd.append("name", values.name);
    fd.append("description", values.description ?? "");
    fd.append("phone", values.phone);
    fd.append("rating_avg", String(values.rating_avg));

    fd.append("is_open", String(!!values.is_open));
    fd.append("accepting_orders", String(!!values.accepting_orders));
    fd.append("temporarily_closed_reason", values.temporarily_closed_reason ?? "");

    fd.append("timezone", values.timezone ?? "");

    fd.append("supports_scheduled_orders", String(!!values.supports_scheduled_orders));
    fd.append("auto_accept_orders", String(!!values.auto_accept_orders));

    fd.append("prep_time_min", String(values.prep_time_min));
    fd.append("prep_time_max", String(values.prep_time_max));

    fd.append("min_order_amount", String(values.min_order_amount));

    fd.append("currency", values.currency);
    fd.append("commission_percent", String(values.commission_percent));

    // arrays
    fd.append("cuisine_types", JSON.stringify(values.cuisine_types ?? []));
    fd.append("tags", JSON.stringify(values.tags ?? []));
    fd.append("fulfillment_modes", JSON.stringify(values.fulfillment_modes ?? []));
    fd.append("payment_methods", JSON.stringify(values.payment_methods ?? []));
    if (values.price_tier != null) fd.append("price_tier", String(values.price_tier));

    // nested address
    fd.append(
        "address",
        JSON.stringify({
            line1: values.addressLine1,
            line2: values.addressLine2 ?? null,
            city: values.city,
            region: values.region,
            postalCode: values.postalCode ?? null,
            country: values.country ?? null,
        })
    );

    // nested delivery
    fd.append(
        "delivery",
        JSON.stringify({
            radius_km: values.delivery_radius_km,
            fee_base: values.delivery_fee_base,
            fee_per_km: values.delivery_fee_per_km ?? null,
            fee_min: values.delivery_fee_min ?? null,
            fee_max: values.delivery_fee_max ?? null,
            free_over_amount: values.delivery_free_over_amount ?? null,
        })
    );

    // location (optional)
    if (values.lat != null && values.lng != null) {
        fd.append("location", JSON.stringify({ type: "Point", coordinates: [values.lng, values.lat] }));
    } else {
        // if you want to CLEAR location when empty, send null explicitly:
        // fd.append("location", JSON.stringify(null));
    }

    // files
    if (files.logoFile) fd.append("logo", files.logoFile);
    if (files.bannerFile) fd.append("banner", files.bannerFile);
    (files.galleryFiles ?? []).forEach((f) => fd.append("gallery", f)); // or "gallery[]" depending backend

    return fd;
}