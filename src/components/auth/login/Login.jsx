import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { login } from "../../../services/Auth";
import { useAuth } from "../../../context/AuthContext";

export default function Login() {
  const [a, setA] = useState();
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();
  const [account, setAccount] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setAccount((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!account.username.trim()) {
      newErrors.username = "Username không được để trống";
    }

    if (!account.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = await login(account);
    if (!data || data.message !== "ok") {
      setLoginError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      return;
    }

    // Lưu user vào context + localStorage
    setAuthUser(data);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* LEFT – NEWS PREVIEW */}
        <div className="hidden md:flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-emerald-600">
            <span className="h-px w-6 bg-emerald-600" />
            Live News Portal
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
            Đăng nhập để theo dõi{" "}
            <span className="text-emerald-600">tin nóng</span> từng phút.
          </h1>

          <p className="text-base text-slate-600">
            Cập nhật nhanh các bản tin chính trị, kinh tế, thể thao và giải trí
            từ nhiều nguồn khác nhau, được cá nhân hoá theo sở thích của bạn.
          </p>

          <div className="mt-4 space-y-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-600 mb-1">
                Breaking • 5 phút trước
              </p>
              <p className="text-sm font-semibold">
                Thị trường chứng khoán châu Á bật tăng sau tin cắt giảm lãi
                suất.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-sky-600 mb-1">
                Thể thao • 15 phút trước
              </p>
              <p className="text-sm font-semibold">
                Đội tuyển quốc gia chuẩn bị cho vòng loại World Cup với lực
                lượng trẻ.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-6 text-sm text-slate-600">
            <div>
              <p className="text-xl font-semibold text-emerald-600">+120</p>
              <p>nguồn tin uy tín</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-emerald-600">24/7</p>
              <p>cập nhật liên tục</p>
            </div>
          </div>
        </div>

        {/* RIGHT – LOGIN FORM */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-7 sm:p-9">
          {/* Logo + Title */}
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white text-lg">
                N
              </div>
              <span className="font-semibold tracking-tight text-base">
                NewsPulse
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Chào mừng trở lại 👋
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Đăng nhập để tiếp tục đọc những câu chuyện đang định hình thế
              giới.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label
                htmlFor="login-username"
                className="block text-sm font-medium text-slate-800 mb-2"
              >
                Username
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                placeholder="username"
                className={`w-full rounded-2xl bg-slate-50 border px-4 py-3 text-base outline-none transition focus:ring-2
                  ${
                    errors.username
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-200"
                  }`}
                value={account.username}
                onChange={handleChange}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username}</p>
              )}
            </div>

            {/* PASSWORD + EYE ICON */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-slate-800"
                >
                  Mật khẩu
                </label>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full rounded-2xl bg-slate-50 border px-4 py-3 pr-14 text-base outline-none transition focus:ring-2
        ${
          errors.password
            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
            : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-200"
        }`}
                  value={account.password}
                  onChange={handleChange}
                />

                {/* CHỈ HIỆN KHI CÓ DỮ LIỆU */}
                {account.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <span>
                      {showPassword ? (
                        // eye-off (to hơn)
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3l18 18M9.88 9.88A3 3 0 0114.12 14.12M6.23 6.23C4.38 7.42 3 9.28 3 12c2 4 5.5 6 9 6 1.27 0 2.48-.21 3.61-.62M17.77 17.77C19.62 16.58 21 14.72 21 12c-2-4-5.5-6-9-6-1.02 0-2 .13-2.94.38"
                          />
                        </svg>
                      ) : (
                        // eye-on (to hơn)
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 12C3.5 7.75 7.25 5 12 5s8.5 2.75 9.75 7c-1.25 4.25-5 7-9.75 7s-8.5-2.75-9.75-7z"
                          />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </span>
                  </button>
                )}
              </div>

              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* REMEMBER + LINK TO REGISTER */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-400 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <span className="text-slate-500">
                Chưa có tài khoản?{" "}
                <NavLink
                  to="/register"
                  className="text-emerald-600 hover:text-emerald-500 font-medium"
                >
                  Đăng ký
                </NavLink>
              </span>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="w-full mt-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 text-base transition shadow-md"
            >
              Đăng nhập
            </button>
          </form>

          {loginError && (
            <p className="text-base text-red-500 text-center">{loginError}</p>
          )}

          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Bằng việc tiếp tục, bạn đồng ý với điều khoản và chính sách của
            NewsPulse.
          </p>
        </div>
      </div>
    </div>
  );
}
