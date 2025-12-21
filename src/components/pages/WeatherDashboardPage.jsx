// src/pages/WeatherDashboardPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getForecast, getVietnamHeatmap, searchLocations } from "../../services/weather/WeatherService";

const LS_WX_LOCATION = "wx_location";

const DEFAULT_LOC = {
  name: "Đà Nẵng",
  latitude: 16.0544,
  longitude: 108.2022,
  timezone: "Asia/Ho_Chi_Minh",
};

const wxLabel = (code) => {
  if (code === 0) return "Trời quang";
  if ([1, 2, 3].includes(code)) return "Ít mây";
  if ([45, 48].includes(code)) return "Sương mù";
  if ([51, 53, 55, 56, 57].includes(code)) return "Mưa phùn";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Mưa";
  if ([71, 73, 75, 77].includes(code)) return "Tuyết";
  if ([95, 96, 99].includes(code)) return "Dông";
  return `Mã ${code}`;
};

const fmtTemp = (v) => (v === null || v === undefined ? "—" : `${Math.round(v)}°`);
const fmt = (v, unit = "") => (v === null || v === undefined ? "—" : `${v}${unit}`);

function tempToColor(t, tmin, tmax) {
  if (t === null || t === undefined) return "hsl(0 0% 85%)";
  const a = (t - tmin) / Math.max(0.0001, tmax - tmin);
  const hue = 220 - Math.max(0, Math.min(1, a)) * 210; // xanh -> đỏ
  return `hsl(${hue} 80% 55%)`;
}

// -------- Simple SVG Line Chart (no libs) --------
function SimpleLineChart({ values = [], height = 170, strokeClass = "text-orange-500" }) {
  const W = 520;
  const H = height;

  if (!values.length) {
    return <div className="h-[140px] flex items-center justify-center text-sm text-slate-500">Chưa có dữ liệu</div>;
  }

  const xs = values.map((_, i) => i);
  const ys = values.map((v) => v);

  const xmin = 0;
  const xmax = values.length - 1;
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);

  const mapX = (x) => ((x - xmin) / Math.max(1e-6, xmax - xmin)) * (W - 40) + 20;
  const mapY = (y) => (H - 20) - ((y - ymin) / Math.max(1e-6, ymax - ymin)) * (H - 40);

  const d = values
    .map((y, i) => `${i === 0 ? "M" : "L"} ${mapX(i).toFixed(2)} ${mapY(y).toFixed(2)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className={strokeClass} />
      {values.map((y, i) => (
        <circle key={i} cx={mapX(i)} cy={mapY(y)} r="2.5" className={strokeClass.replace("text-", "fill-")} />
      ))}
    </svg>
  );
}

// -------- Vietnam Dot Map --------
function VietnamDotMap({ data = [] }) {
  if (!data.length) {
    return <div className="h-[520px] flex items-center justify-center text-sm text-slate-500">Đang tải bản đồ…</div>;
  }

  const lats = data.map((d) => d.latitude);
  const lons = data.map((d) => d.longitude);
  const temps = data.map((d) => d.temperature).filter((x) => x !== null && x !== undefined);

  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);
  const lonMin = Math.min(...lons);
  const lonMax = Math.max(...lons);

  const tmin = temps.length ? Math.min(...temps) : 0;
  const tmax = temps.length ? Math.max(...temps) : 40;

  const W = 520;
  const H = 520;

  const x = (lon) => ((lon - lonMin) / Math.max(1e-6, lonMax - lonMin)) * (W - 40) + 20;
  const y = (lat) => (H - 20) - ((lat - latMin) / Math.max(1e-6, latMax - latMin)) * (H - 40);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {data.map((p) => (
          <circle
            key={p.name}
            cx={x(p.longitude)}
            cy={y(p.latitude)}
            r="5"
            fill={tempToColor(p.temperature, tmin, tmax)}
            stroke="white"
            strokeWidth="1"
          >
            <title>
              {p.name}: {p.temperature ?? "—"}°C
            </title>
          </circle>
        ))}
      </svg>

      <div className="mt-3">
        <div
          className="h-2 rounded-full"
          style={{ background: "linear-gradient(90deg, hsl(220 80% 55%), hsl(10 80% 55%))" }}
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{Math.round(tmin)}°</span>
          <span>{Math.round(tmax)}°</span>
        </div>
      </div>
    </div>
  );
}

export default function WeatherDashboardPage() {
  const [sp] = useSearchParams();

  // location shown in this page (NOT necessarily default)
  const [loc, setLoc] = useState(() => {
    // 1) ưu tiên localStorage (default đã chọn từ header)
    try {
      const raw = localStorage.getItem(LS_WX_LOCATION);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_LOC;
  });

  const [forecast, setForecast] = useState(null);
  const [heat, setHeat] = useState([]);

  const [loadingForecast, setLoadingForecast] = useState(false);
  const [err, setErr] = useState("");

  // dropdown search
  const [openPicker, setOpenPicker] = useState(false);
  const [q, setQ] = useState("");
  const [suggest, setSuggest] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const debRef = useRef(null);

  // -------- read query params from /weather?lat=...&lon=... --------
  useEffect(() => {
    const lat = parseFloat(sp.get("lat"));
    const lon = parseFloat(sp.get("lon"));
    const name = sp.get("name");
    const tz = sp.get("tz") || "Asia/Ho_Chi_Minh";

    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      // NOTE: "Xem" không đổi default => không ghi localStorage
      setLoc({
        name: name || "Địa điểm",
        latitude: lat,
        longitude: lon,
        timezone: tz,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  // -------- load forecast for current page loc --------
  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      setLoadingForecast(true);
      try {
        const data = await getForecast({
          lat: loc.latitude,
          lon: loc.longitude,
          tz: loc.timezone || "Asia/Ho_Chi_Minh",
          days: 7,
        });
        if (!alive) return;
        setForecast(data);
      } catch (e) {
        if (!alive) return;
        setForecast(null);
        setErr("Không lấy được dự báo. Kiểm tra API /api/weather/forecast/");
      } finally {
        if (alive) setLoadingForecast(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loc]);

  // -------- load heatmap once --------
  useEffect(() => {
    (async () => {
      const res = await getVietnamHeatmap();
      setHeat(res || []);
    })();
  }, []);

  // -------- search location suggestions --------
  useEffect(() => {
    const text = q.trim();
    if (debRef.current) clearTimeout(debRef.current);

    if (text.length < 2) {
      setSuggest([]);
      return;
    }

    debRef.current = setTimeout(async () => {
      try {
        setLoadingSuggest(true);
        const res = await searchLocations(text);
        setSuggest(res || []);
      } finally {
        setLoadingSuggest(false);
      }
    }, 300);

    return () => debRef.current && clearTimeout(debRef.current);
  }, [q]);

  const pick = (s) => {
    setLoc({
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
      timezone: s.timezone || "Asia/Ho_Chi_Minh",
    });
    setOpenPicker(false);
    setQ("");
    setSuggest([]);
  };

  const cur = forecast?.current;

  // 24h temps
  const hourlyTemps = useMemo(() => {
    const h = forecast?.hourly;
    if (!h?.time?.length) return [];
    const temps = h.temperature_2m || [];
    return temps.slice(0, 24).filter((x) => x !== null && x !== undefined);
  }, [forecast]);

  // daily max/min 7 days
  const dailyMax = useMemo(() => {
    const d = forecast?.daily;
    if (!d?.time?.length) return [];
    return (d.temperature_2m_max || []).slice(0, 7);
  }, [forecast]);

  const dailyMin = useMemo(() => {
    const d = forecast?.daily;
    if (!d?.time?.length) return [];
    return (d.temperature_2m_min || []).slice(0, 7);
  }, [forecast]);

  const dailyDates = useMemo(() => {
    const d = forecast?.daily;
    if (!d?.time?.length) return [];
    return (d.time || []).slice(0, 7);
  }, [forecast]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      {/* Top header */}
      <div className="flex items-center gap-3">
        <div className="text-xl font-semibold text-slate-900">Thời tiết</div>

        {/* Location picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenPicker((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
            title="Chọn địa điểm"
          >
            <span className="font-semibold text-slate-800">{loc.name}</span>
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {openPicker && (
            <div className="absolute left-0 mt-2 w-[380px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50">
              <div className="p-3">
                <div className="relative">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm địa điểm"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  {loadingSuggest && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">…</span>
                  )}
                </div>

                <div className="mt-2 max-h-72 overflow-y-auto no-scrollbar">
                  {suggest.map((s) => (
                    <button
                      key={`${s.id}-${s.latitude}-${s.longitude}`}
                      type="button"
                      onClick={() => pick(s)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="font-medium text-slate-800">
                        {s.name}
                        {s.admin1 ? `, ${s.admin1}` : ""}
                      </div>
                      <div className="text-xs text-slate-500">
                        {s.latitude}, {s.longitude}
                      </div>
                    </button>
                  ))}

                  {!suggest.length && (
                    <div className="text-sm text-slate-500 px-1 py-2">Nhập để tìm tỉnh/thành…</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-100">
          {err}
        </div>
      )}

      {/* Main grid */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="text-sm text-slate-500">Hiện tại</div>

            {loadingForecast ? (
              <div className="h-[120px] flex items-center text-slate-600">Đang tải…</div>
            ) : (
              <>
                <div className="mt-2 flex items-start gap-4">
                  <div className="text-5xl font-semibold text-slate-900">
                    {fmtTemp(cur?.temperature_2m)}
                  </div>
                  <div>
                    <div className="text-slate-800 font-medium">{wxLabel(cur?.weather_code)}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      Cảm giác như {fmtTemp(cur?.apparent_temperature)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="text-slate-500">Độ ẩm</div>
                    <div className="font-semibold">{fmt(cur?.relative_humidity_2m, "%")}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="text-slate-500">Gió</div>
                    <div className="font-semibold">{fmt(cur?.wind_speed_10m, " km/h")}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="text-slate-500">Mưa</div>
                    <div className="font-semibold">{fmt(cur?.precipitation, " mm")}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="text-slate-500">UV</div>
                    <div className="font-semibold">—</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Hourly 24h */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-900">Theo giờ</div>
              <div className="text-xs text-slate-500">24h tiếp theo</div>
            </div>

            <div className="mt-3 text-slate-900">
              <SimpleLineChart values={hourlyTemps} height={170} strokeClass="text-orange-500" />
            </div>

            {/* labels */}
            {hourlyTemps.length > 0 && (
              <div className="mt-2 text-xs text-slate-500">
                Min: <span className="font-semibold text-slate-700">{fmtTemp(Math.min(...hourlyTemps))}</span> • Max:{" "}
                <span className="font-semibold text-slate-700">{fmtTemp(Math.max(...hourlyTemps))}</span>
              </div>
            )}
          </div>

          {/* Daily 7 days */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="font-semibold text-slate-900">Theo ngày</div>

            <div className="mt-3">
              <div className="text-sm text-slate-500 mb-2">Cao nhất (cam)</div>
              <SimpleLineChart values={dailyMax} height={160} strokeClass="text-orange-500" />

              <div className="mt-4 text-sm text-slate-500 mb-2">Thấp nhất (xanh)</div>
              <SimpleLineChart values={dailyMin} height={160} strokeClass="text-sky-600" />

              {dailyDates.length > 0 && (
                <div className="mt-3 overflow-x-auto no-scrollbar">
                  <div className="flex gap-3 text-xs text-slate-500">
                    {dailyDates.map((d, i) => (
                      <div key={d} className="px-3 py-2 rounded-xl bg-slate-50 min-w-[110px]">
                        <div className="font-semibold text-slate-700">{d}</div>
                        <div>
                          {fmtTemp(dailyMax[i])} / {fmtTemp(dailyMin[i])}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Heat map */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="font-semibold text-slate-900">Bản đồ nhiệt hiện tại</div>
          <div className="text-xs text-slate-500 mt-1">Nhiệt độ (°C) theo điểm tỉnh/thành</div>
          <div className="mt-3">
            <VietnamDotMap data={heat} />
          </div>
        </div>
      </div>
    </div>
  );
}
