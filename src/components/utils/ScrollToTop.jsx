// src/components/common/ScrollToTop.jsx
import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const parseCategoryPath = (path) => {
  const m = (path || "").match(/^\/category\/([^\/]+)(?:\/([^\/]+))?/);
  if (!m) return null;
  return { slug: m[1], childSlug: m[2] || null };
};

export default function ScrollToTop() {
  const { pathname, search, state } = useLocation();
  const prevPathRef = useRef("");

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const prevPath = prevPathRef.current;
    const nextPath = pathname;

    // Option: tắt scroll theo từng navigate nếu muốn
    if (state?.noScroll) {
      prevPathRef.current = nextPath;
      return;
    }

    // ✅ chỉ bỏ scroll khi cùng slug (đổi childSlug)
    const prevCat = parseCategoryPath(prevPath);
    const nextCat = parseCategoryPath(nextPath);
    const isSameCategorySlug =
      prevCat?.slug && nextCat?.slug && prevCat.slug === nextCat.slug;

    if (isSameCategorySlug) {
      prevPathRef.current = nextPath;
      return;
    }

    const reset = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const scroller =
        document.querySelector("[data-scroll-container]") ||
        document.querySelector("#app-scroll");
      if (scroller) scroller.scrollTop = 0;
    };

    // ✅ LOCK để tránh auto-scroll khác chạy đè ngay lập tức
    window.__APP_SCROLL_LOCK_UNTIL__ = Date.now() + 200;

    reset();
    const raf = requestAnimationFrame(reset);
    const t = setTimeout(reset, 30);

    prevPathRef.current = nextPath;

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [pathname, search, state]);

  return null;
}
