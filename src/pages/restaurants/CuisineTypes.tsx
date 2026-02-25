import { useEffect, useMemo, useState } from "react";
import { Select, message } from "antd";
import { FoodAPI } from "../../api/food";

type Category = { _id: string; name: string; sort_order: number };

type Props = {
    value?: string;
    onChange: (value?: string) => void;
    width?: number;
    placeholder?: string;
    allowClear?: boolean;
    disabled?: boolean;
    // optional: if you ever want to reuse fetched categories outside
    onLoaded?: (categories: Category[]) => void;
};

// assumes MenuAPI is in scope/imported in your project
export function CuisineTypes({
    value,
    onChange,
    placeholder = "Filter by category",
    allowClear = true,
    disabled,
    onLoaded,
}: Props) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    const options = useMemo(
        () => categories.map((c) => ({ label: c.name, value: c._id })),
        [categories]
    );

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await FoodAPI.restaurantTypes();
            const list: Category[] = res.data.categories ?? [];
            setCategories(list);
            onLoaded?.(list);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Failed to load categories");
            setCategories([]);
            onLoaded?.([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Select
            allowClear={allowClear}
            placeholder={placeholder}
            value={value}
            onChange={(v) => onChange(v)}
            options={options}
            loading={loading}
            disabled={disabled || loading}
        />
    );
}