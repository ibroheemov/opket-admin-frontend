import { useEffect, useMemo, useState } from "react";
import { Select, message } from "antd";
import { FaresAPI, type Fare } from "../../api/fares";


type Props = {
    value?: string;
    onChange: (value?: string) => void;
    width?: number;
    placeholder?: string;
    allowClear?: boolean;
    disabled?: boolean;
    // optional: if you ever want to reuse fetched categories outside
};

// assumes MenuAPI is in scope/imported in your project
export function Tariffs({
    value,
    onChange,
    allowClear = true,
    disabled,
}: Props) {
    const [categories, setCategories] = useState<Fare[]>([]);
    const [loading, setLoading] = useState(false);

    const options = useMemo(
        () => categories.map((c) => ({ label: c.type, value: c._id })),
        [categories]
    );

    const loadCategories = async () => {
        setLoading(true);
        try {
            const list = await FaresAPI.list();
            setCategories(list);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? "Failed to load categories");
            setCategories([]);
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
            mode="tags"
            allowClear={allowClear}
            value={value}
            onChange={(v) => onChange(v)}
            options={options}
            loading={loading}
            disabled={disabled || loading}
        />
    );
}