export type GeoPoint = { type: "Point"; coordinates: [number, number] }; // [lng, lat]
export type RestaurantStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type FulfillmentMode = "DELIVERY" | "PICKUP";
export type PaymentMethod = "CASH" | "CARD" | "WALLET";
export type PriceTier = 1 | 2 | 3 | 4;

export type Restaurant = {
    _id: string;

    ownerUserId?: string;
    status: RestaurantStatus;

    name: string;
    description?: string | null;
    phone: string;

    address: {
        line1: string;
        line2?: string | null;
        city: string;
        region: string;
        postalCode?: string | null;
        country?: string | null;
    };

    location?: GeoPoint | null;

    logo_url?: string | null;
    banner_url?: string | null;
    gallery_urls?: string[];

    cuisine_types: string[];
    cuisineTypeId: string | null;

    tags?: string[];
    price_tier?: PriceTier | null;

    is_open: boolean;
    accepting_orders: boolean;
    temporarily_closed_reason?: string | null;

    timezone?: string | null;
    hours_json?: any;

    fulfillment_modes: FulfillmentMode[];
    payment_methods: PaymentMethod[];
    supports_scheduled_orders: boolean;
    auto_accept_orders: boolean;

    prep_time_min: number;
    prep_time_max: number;

    min_order_amount: number;
    delivery: {
        radius_km: number;
        fee_base: number;
        fee_per_km?: number | null;
        fee_min?: number | null;
        fee_max?: number | null;
        free_over_amount?: number | null;
    };

    currency: string;
    commission_percent: number;
    rating_avg: number;

    createdAt?: string;
    updatedAt?: string;
};