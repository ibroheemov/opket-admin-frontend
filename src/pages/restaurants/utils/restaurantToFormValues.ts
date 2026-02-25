import type { Restaurant } from "../../../types/restaurant";
import type { RestaurantFormValues } from "../RestaurantForm";

export function restaurantToFormValues(r: Restaurant): Partial<RestaurantFormValues> {
    return {
        ownerUserId: r.ownerUserId,
        status: r.status,

        name: r.name ?? "",
        description: r.description ?? undefined,
        phone: r.phone ?? "",

        addressLine1: r.address?.line1 ?? "",
        addressLine2: r.address?.line2 ?? undefined,
        city: r.address?.city ?? "",
        region: r.address?.region ?? "",
        postalCode: r.address?.postalCode ?? undefined,
        country: r.address?.country ?? undefined,

        // GeoJSON Point: [lng, lat]
        lat: r.location?.coordinates?.[1],
        lng: r.location?.coordinates?.[0],

        cuisine_types: r.cuisine_types ?? [],
        tags: r.tags ?? [],
        price_tier: r.price_tier ?? undefined,

        is_open: !!r.is_open,
        accepting_orders: !!r.accepting_orders,
        temporarily_closed_reason: r.temporarily_closed_reason ?? undefined,

        timezone: r.timezone ?? undefined,

        fulfillment_modes: r.fulfillment_modes ?? [],
        payment_methods: r.payment_methods ?? [],
        supports_scheduled_orders: !!r.supports_scheduled_orders,
        auto_accept_orders: !!r.auto_accept_orders,

        prep_time_min: r.prep_time_min ?? 15,
        prep_time_max: r.prep_time_max ?? 45,

        min_order_amount: r.min_order_amount ?? 0,

        delivery_radius_km: r.delivery?.radius_km ?? 0,
        delivery_fee_base: r.delivery?.fee_base ?? 0,
        delivery_fee_per_km: r.delivery?.fee_per_km ?? undefined,
        delivery_fee_min: r.delivery?.fee_min ?? undefined,
        delivery_fee_max: r.delivery?.fee_max ?? undefined,
        delivery_free_over_amount: r.delivery?.free_over_amount ?? undefined,

        currency: r.currency ?? "UZS",
        commission_percent: r.commission_percent ?? 0,
    };
}