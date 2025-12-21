// src/components/layout/WeatherMini.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTodayWeather, searchLocations } from "../../services/weather/WeatherService";

const LS_WX_LOCATION = "wx_location";
const LS_WX_AUTO = "wx_auto_locate";

// Mặc định Đà Nẵng
const DEFAULT_LOC = {
  id: "dn",
  name: "Đà Nẵng",
  latitude: 16.0544,
  longitude: 108.2022,
  timezone: "Asia/Ho_Chi_Minh",
};

const PRESET = [
  { id: "hn", name: "Hà Nội", latitude: 21.0278, longitude: 105.8342, timezone: "Asia/Ho_Chi_Minh" },
  { id: "hcm", name: "TP HCM", latitude: 10.8231, longitude: 106.6297, timezone: "Asia/Ho_Chi_Minh" },
  { id: "dn", name: "Đà Nẵng", latitude: 16.0544, longitude: 108.2022, timezone: "Asia/Ho_Chi_Minh" },
  { id: "ag", name: "An Giang", latitude: 10.5216, longitude: 105.1259, timezone: "Asia/Ho_Chi_Minh" },
  { id: "vt", name: "Vũng Tàu", latitude: 10.4114, longitude: 107.1362, timezone: "Asia/Ho_Chi_Minh" },
];

const wxLabel = (code) => {
  if (code === 0) return "Trời quang";
  if ([1, 2, 3].includes(code)) return "Ít mây";
  if ([45, 48].includes(code)) return "Sương mù";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Mưa";
  if ([95, 96, 99].includes(code)) return "Dông";
  return `Mã ${code}`;
};

const WeatherIcon = ({ code }) => (
  <svg className="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M7 19a4 4 0 0 1 .4-7.98A6 6 0 0 1 19 9a5 5 0 0 1 0 10H7z" />
    {[61, 63, 65, 80, 81, 82].includes(code) && (
      <>
        <path d="M9 20l-1 2" />
        <path d="M13 20l-1 2" />
        <path d="M17 20l-1 2" />
      </>
    )}
  </svg>
);

const keyOf = (x) => `${Number(x.latitude).toFixed(4)},${Number(x.longitude).toFixed(4)}`;

export default function WeatherMini() {
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  const closeTimerRef = useRef(null);
  const debounceRef = useRef(null);
  const hoverFetchRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [autoLocate, setAutoLocate] = useState(() => localStorage.getItem(LS_WX_AUTO) === "1");

  const [query, setQuery] = useState("");
  const [remoteSuggestions, setRemoteSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  const [loc, setLoc] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_WX_LOCATION);
      return raw ? JSON.parse(raw) : DEFAULT_LOC;
    } catch {
      return DEFAULT_LOC;
    }
  });

  const [loadingHeader, setLoadingHeader] = useState(false);
  const [headerTemp, setHeaderTemp] = useState(null);
  const [headerCode, setHeaderCode] = useState(2);

  // tooltip temps cache: { "lat,lon": { temp, code } }
  const [tempCache, setTempCache] = useState({});
  const [hoverKey, setHoverKey] = useState("");

  const displayTemp = useMemo(() => {
    if (headerTemp === null || headerTemp === undefined) return "—°";
    return `${Math.round(headerTemp)}°`;
  }, [headerTemp]);

  const defaultKey = useMemo(() => keyOf(loc), [loc]);

  // ---------- fetch header weather ----------
  const fetchHeader = async (picked) => {
    if (!picked?.latitude || !picked?.longitude) return;

    setLoadingHeader(true);
    try {
      const data = await getTodayWeather({
        lat: picked.latitude,
        lon: picked.longitude,
        tz: picked.timezone || "Asia/Ho_Chi_Minh",
      });
      setHeaderTemp(data?.temperature ?? null);
      setHeaderCode(data?.weather_code ?? 2);
    } finally {
      setLoadingHeader(false);
    }
  };

  // load header on mount
  useEffect(() => {
    fetchHeader(loc);
    const t = setInterval(() => fetchHeader(loc), 10 * 60 * 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- auto locate ----------
  useEffect(() => {
    localStorage.setItem(LS_WX_AUTO, autoLocate ? "1" : "0");
    if (!autoLocate) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords || {};
        if (!latitude || !longitude) return;
        const picked = {
          id: "my-pos",
          name: "Vị trí của bạn",
          latitude,
          longitude,
          timezone: "Asia/Ho_Chi_Minh",
        };
        // auto locate -> coi như đổi default luôn
        setLoc(picked);
        localStorage.setItem(LS_WX_LOCATION, JSON.stringify(picked));
        await fetchHeader(picked);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLocate]);

  // ---------- hover open/close (auto dropdown) ----------
  const openNow = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpen(true);
  };

  const closeSoon = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), 180);
  };

  // click outside (phòng trường hợp user click)
  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      const wrap = wrapRef.current;
      if (wrap && !wrap.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  // ---------- search locations ----------
  useEffect(() => {
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 2) {
      setRemoteSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoadingSuggest(true);
        const res = await searchLocations(q);
        setRemoteSuggestions(res || []);
      } finally {
        setLoadingSuggest(false);
      }
    }, 300);

    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [query]);

  const listToShow = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length >= 2) return remoteSuggestions;
    return PRESET;
  }, [query, remoteSuggestions]);

  // ---------- hover tooltip fetch ----------
  const ensureTempFor = async (x) => {
    const k = keyOf(x);
    if (tempCache[k]) return;

    try {
      const data = await getTodayWeather({
        lat: x.latitude,
        lon: x.longitude,
        tz: x.timezone || "Asia/Ho_Chi_Minh",
      });
      if (!data) return;

      setTempCache((prev) => ({
        ...prev,
        [k]: { temp: data.temperature, code: data.weather_code },
      }));
    } catch {
      // ignore
    }
  };

  const onHoverRow = (x) => {
    const k = keyOf(x);
    setHoverKey(k);

    if (hoverFetchRef.current) clearTimeout(hoverFetchRef.current);
    hoverFetchRef.current = setTimeout(() => ensureTempFor(x), 120);
  };

  const clearHoverRow = () => {
    if (hoverFetchRef.current) clearTimeout(hoverFetchRef.current);
    setHoverKey("");
  };

  // ---------- actions ----------
  const setDefaultLocation = async (x) => {
    setAutoLocate(false);
    setLoc(x);
    localStorage.setItem(LS_WX_LOCATION, JSON.stringify(x));
    await fetchHeader(x);
  };

  const viewLocation = (x) => {
    // đi trang /weather theo đúng địa điểm (không đổi default)
    const params = new URLSearchParams({
      name: x.name || "",
      lat: String(x.latitude),
      lon: String(x.longitude),
      tz: x.timezone || "Asia/Ho_Chi_Minh",
    }).toString();

    setOpen(false);
    navigate(`/weather?${params}`);
  };

  return (
    <div
      className="relative"
      ref={wrapRef}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      {/* pill on header */}
      <button
        type="button"
        onClick={() => viewLocation(loc)} // click pill -> xem thời tiết của location hiện tại
        className="inline-flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-50 cursor-pointer"
        title="Xem thời tiết"
      >
        <span className="text-sm font-medium text-slate-700">{loc?.name || "Đà Nẵng"}</span>
        <span className="inline-flex items-center gap-1">
          <WeatherIcon code={headerCode ?? 2} />
          <span className="text-sm font-semibold text-slate-800">{loadingHeader ? "…" : displayTemp}</span>
        </span>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* dropdown */}
      <div
        className={`
          absolute left-0 top-full mt-2 w-[340px]
          bg-white border border-slate-200 rounded-2xl shadow-xl z-50
          transform origin-top-left transition-all duration-150
          ${open ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 -translate-y-2 scale-95 pointer-events-none"}
        `}
      >
        <div className="p-3">
          {/* toggle auto locate */}
          <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl hover:bg-slate-50">
            <div className="flex items-center gap-2 text-slate-700">
              <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2a8 8 0 0 1 8 8c0 7-8 12-8 12S4 17 4 10a8 8 0 0 1 8-8z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span className="text-sm">Tự động xác định vị trí</span>
            </div>

            <button
              type="button"
              onClick={() => setAutoLocate((v) => !v)}
              className={`w-12 h-7 rounded-full relative transition ${autoLocate ? "bg-sky-600" : "bg-slate-200"}`}
              aria-label="Toggle auto locate"
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition ${
                  autoLocate ? "left-6" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* search */}
          <div className="mt-2 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="20" y2="20" />
              </svg>
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm địa điểm"
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setRemoteSuggestions([]);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Clear"
              >
                ✕
              </button>
            )}
            {loadingSuggest && (
              <span className="absolute right-9 top-1/2 -translate-y-1/2 text-xs text-slate-500">…</span>
            )}
          </div>

          {/* list */}
          <div className="mt-2 max-h-72 overflow-y-auto no-scrollbar">
            {listToShow.map((x) => {
              const k = keyOf(x);
              const isDefault = k === defaultKey;
              const hoverTemp = tempCache[k]?.temp;
              const hoverCode = tempCache[k]?.code;

              return (
                <div
                  key={`${x.id || x.name}-${k}`}
                  className="group relative rounded-xl hover:bg-slate-50 px-2 py-2"
                  onMouseEnter={() => onHoverRow(x)}
                  onMouseLeave={clearHoverRow}
                >
                  {/* row content */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{x.name}</div>
                      {x.admin1 && x.admin1 !== x.name && (
                        <div className="text-xs text-slate-500 truncate">{x.admin1}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isDefault && (
                        <span className="text-xs text-slate-500">Mặc định</span>
                      )}
                      {isDefault && (
                        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="12" cy="12" r="8" />
                          <circle cx="12" cy="12" r="2" />
                          <line x1="12" y1="2" x2="12" y2="5" />
                          <line x1="12" y1="19" x2="12" y2="22" />
                          <line x1="2" y1="12" x2="5" y2="12" />
                          <line x1="19" y1="12" x2="22" y2="12" />
                        </svg>
                      )}

                      {/* actions: chỉ hiện khi hover */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => setDefaultLocation(x)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                        >
                          Chọn mặc định
                        </button>
                        <button
                          type="button"
                          onClick={() => viewLocation(x)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                        >
                          Xem
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* tooltip nhiệt độ: chỉ hiện khi hover đúng row */}
                  {hoverKey === k && (
                    <div className="absolute left-[120px] top-full mt-1 z-50">
                      <div className="px-2 py-1 rounded-lg border border-slate-200 bg-white shadow text-xs text-slate-700 whitespace-nowrap">
                        {x.name} hiện tại{" "}
                        <span className="font-semibold">
                          {hoverTemp !== undefined && hoverTemp !== null ? `${Math.round(hoverTemp)}°` : "…"}
                        </span>
                        {hoverCode !== undefined && hoverCode !== null ? ` • ${wxLabel(hoverCode)}` : ""}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {!listToShow.length && (
              <div className="px-2 py-3 text-sm text-slate-500">Không tìm thấy địa điểm</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
