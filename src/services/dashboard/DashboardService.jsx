// src/services/admin/DashboardService.js

const API_BASE = "/api"; // khớp với BE: path("admin/", include(...))

async function fetchJSON(url, opts = {}) {
    const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(opts.headers || {}),
        },
        ...opts,
    });

    // cố đọc json để lấy message lỗi (nếu BE trả json)
    let data = null;
    try {
        data = await res.json();
    } catch (e) {
        // ignore
    }

    if (!res.ok) {
        const msg =
            data?.message ||
            data?.detail ||
            `Request failed: ${res.status} ${res.statusText}`;
        throw new Error(msg);
    }

    return data;
}

// --------------------------
// Dashboard APIs
// --------------------------
export function adminGetDashboardKPIs(range = "7d") {
    return fetchJSON(`${API_BASE}/dashboard/kpis?range=${encodeURIComponent(range)}`);
}

export function adminGetViewsSeries(range = "30d", site = "") {
    const qs = new URLSearchParams();
    qs.set("range", range);
    if (site) qs.set("site", site);
    return fetchJSON(`${API_BASE}/dashboard/views-series?${qs.toString()}`);
}

export function adminGetCommentsSeries(range = "30d") {
    return fetchJSON(`${API_BASE}/dashboard/comments-series?range=${encodeURIComponent(range)}`);
}

export function adminGetTopArticles(limit = 10) {
    return fetchJSON(`${API_BASE}/dashboard/top-articles?limit=${encodeURIComponent(limit)}`);
}

export function adminGetViewsByCategory(range = "30d", limit = 6, site = "") {
    const qs = new URLSearchParams();
    qs.set("range", range);
    qs.set("limit", String(limit));
    if (site) qs.set("site", site);
    return fetchJSON(`${API_BASE}/dashboard/views-by-category?${qs.toString()}`);
}

export function adminGetViewsBySite(range = "30d") {
    return fetchJSON(`${API_BASE}/dashboard/views-by-site?range=${encodeURIComponent(range)}`);
}
