// src/components/admin/dashboard/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";

import StatCard from "./StatCard";
import RevenueChart from "./RevenueChart";
import TopDestinations from "./TopDestinations";
import Messages from "./Messages";
import TravelPackages from "./TravelPackages";
import article from "../../assets/customer-review.png"
import user from "../../assets/article.png"
import cmt from "../../assets/booking.png"
import view from "../../assets/total_view.png"
import {
    adminGetDashboardKPIs,
    adminGetViewsSeries,
    adminGetViewsByCategory,
    adminGetTopArticles,
    adminGetCommentsSeries,
} from "../../services/dashboard/DashboardService.jsx";

// -------------------- helpers --------------------
const fmtNumber = (n) => {
    try {
        return (Number(n) || 0).toLocaleString("vi-VN");
    } catch {
        return String(n ?? 0);
    }
};

const parseRangeDays = (range) => {
    const s = String(range || "7d").toLowerCase().trim();
    if (s.endsWith("d")) {
        const n = parseInt(s.slice(0, -1), 10);
        return Number.isFinite(n) && n > 0 ? n : 7;
    }
    return 7;
};

// YYYY-MM-DD -> Date (00:00 VN)
const ymdToDateVN = (ymd) => {
    if (!ymd) return null;
    // +07:00 vì VN không DST
    const d = new Date(`${ymd}T00:00:00+07:00`);
    return Number.isNaN(d.getTime()) ? null : d;
};

// Date -> YYYY-MM-DD (VN)
const dateToYMDVN = (date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    return `${y}-${m}-${d}`;
};

/**
 * Fill đủ N ngày theo "ngày mới nhất có trong data" (latest day).
 * Nếu data rỗng -> fallback theo today.
 */
const fillSeriesByLatestDay = (raw = [], days = 7) => {
    const map = new Map((raw || []).map((x) => [x.day, Number(x.views) || 0]));

    // lấy latest day từ raw (max theo string YYYY-MM-DD)
    const latestDayStr =
        (raw || [])
            .map((x) => x.day)
            .filter(Boolean)
            .sort()
            .slice(-1)[0] || dateToYMDVN(new Date());

    const endDate = ymdToDateVN(latestDayStr) || new Date();
    const out = [];

    for (let i = days - 1; i >= 0; i--) {
        const dt = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
        const day = dateToYMDVN(dt);
        out.push({ day, views: map.get(day) ?? 0 });
    }
    return out;
};

// -------------------- component --------------------
const Dashboard = () => {
    const [range, setRange] = useState("7d");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [kpis, setKpis] = useState(null);
    const [viewsSeries, setViewsSeries] = useState([]);
    const [viewsByCategory, setViewsByCategory] = useState([]);
    const [topArticles, setTopArticles] = useState([]);
    const [commentsSeries, setCommentsSeries] = useState([]);

    useEffect(() => {
        let alive = true;

        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const days = parseRangeDays(range);

                const [k, vs, cat, top, cs] = await Promise.all([
                    adminGetDashboardKPIs(range),
                    adminGetViewsSeries(range),
                    adminGetViewsByCategory(range, 6),
                    adminGetTopArticles(8),
                    adminGetCommentsSeries(range),
                ]);

                if (!alive) return;

                setKpis(k || null);

                // ✅ SỬA Ở ĐÂY: fill theo latest day của DB (không theo now)
                const rawSeries = vs?.data || [];
                setViewsSeries(vs?.data || []);


                setViewsByCategory(cat?.data || []);
                setTopArticles(top?.data || []);
                setCommentsSeries(cs?.data || []);
            } catch (e) {
                if (!alive) return;

                setError(e?.message || "Load dashboard failed");
                setKpis(null);
                setViewsSeries([]);
                setViewsByCategory([]);
                setTopArticles([]);
                setCommentsSeries([]);
            } finally {
                if (alive) setLoading(false);
            }
        };

        load();
        return () => {
            alive = false;
        };
    }, [range]);

    const statCards = useMemo(() => {
        const totalArticles = kpis?.articles?.total ?? 0;
        const newArticles = kpis?.articles?.new ?? 0;

        const totalUsers = kpis?.users?.total ?? 0;
        const newUsers = kpis?.users?.new ?? 0;

        const pendingComments = kpis?.comments?.pending ?? 0;
        const newComments = kpis?.comments?.new ?? 0;

        const totalViews = kpis?.views?.total ?? 0;

        return [
            {
                icon: user,
                iconType: "image",
                title: "Total Articles",
                value: fmtNumber(totalArticles),
                change: `+${fmtNumber(newArticles)} new (${range})`,
                isPositive: true,
            },
            {
                icon: article,
                iconType: "image",
                title: "Total Users",
                value: fmtNumber(totalUsers),
                change: `+${fmtNumber(newUsers)} new (${range})`,
                isPositive: true,
            },
            {
                icon: cmt,
                iconType: "image",
                title: "Pending Comments",
                value: fmtNumber(pendingComments),
                change: `+${fmtNumber(newComments)} new (${range})`,
                isPositive: pendingComments === 0,
            },
            {
                icon: view,
                iconType: "image",
                title: "Total Views",
                value: fmtNumber(totalViews),
                change: `in ${range}`,
                isPositive: true,
            },
        ];
    }, [kpis, range]);

    return (
        <div className="flex-1 p-8 bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Thống Kê</h1>

                <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                </select>
            </div>

            {/* Error */}
            {error ? (
                <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700">
                    {error}
                </div>
            ) : null}

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {statCards.map((s) => (
                    <StatCard
                        key={s.title}
                        icon={s.icon}
                        title={s.title}
                        value={loading ? "…" : s.value}
                        change={loading ? "Loading…" : s.change}
                        isPositive={s.isPositive}
                    />
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RevenueChart title="Views Overview" data={viewsSeries} loading={loading} />
                <TopDestinations title="Views by Category" data={viewsByCategory} loading={loading} />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TravelPackages title="Top Articles" data={topArticles} loading={loading} />
                <Messages
                    title="Recent / Pending Comments"
                    pendingCount={kpis?.comments?.pending ?? 0}
                    series={commentsSeries}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default Dashboard;
