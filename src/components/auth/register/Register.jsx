import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerApi } from "../../../services/Auth";

function calcAgeFromDob(dobStr) {
  const [a, setA] = useState();
  const dob = new Date(dobStr);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    dob: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  // 👁 state hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!form.fullname.trim()) newErrors.fullname = "Họ tên không được để trống";
    if (!form.username.trim()) newErrors.username = "Username không được để trống";
    if (!form.email.trim()) newErrors.email = "Email không được để trống";
    if (!form.dob) newErrors.dob = "Ngày sinh không được để trống";
    if (!form.password) newErrors.password = "Mật khẩu không được để trống";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Nhập lại mật khẩu không được để trống";

    if (form.username && form.username.length < 6) {
      newErrors.username = "Username phải có ít nhất 6 ký tự";
    }
    if (form.password && form.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (form.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = "Email không hợp lệ";
      }
    }

    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }

    if (form.dob) {
      const age = calcAgeFromDob(form.dob);
      if (age === null || age < 0 || age > 120) {
        newErrors.dob = "Ngày sinh không hợp lệ";
      }
    }

    if (!form.acceptTerms) {
      newErrors.acceptTerms = "Bạn cần đồng ý với điều khoản sử dụng";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const age = calcAgeFromDob(form.dob);

    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      fullname: form.fullname.trim(),
      age: age,
    };

    const res = await registerApi(payload);

    if (!res.ok) {
      if (res.status === 400 && res.detail) {
        if (res.detail === "Username exists") {
          setErrors((prev) => ({
            ...prev,
            username: "Username đã tồn tại",
          }));
        } else if (res.detail === "Email exists") {
          setErrors((prev) => ({
            ...prev,
            email: "Email đã tồn tại",
          }));
        } else {
          setFormError(res.detail);
        }
      } else {
        setFormError("Đăng ký thất bại. Vui lòng thử lại.");
      }
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Đăng ký thành công!",
      text: "Bạn có thể đăng nhập để bắt đầu sử dụng NewsPulse.",
      showConfirmButton: false,
    });

    navigate("/login");
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
            Tạo tài khoản để{" "}
            <span className="text-emerald-600">cá nhân hoá</span> tin tức.
          </h1>

          <p className="text-base text-slate-600">
            Lưu bài viết yêu thích, theo dõi chuyên mục và nhận thông báo tin nóng
            theo chủ đề bạn quan tâm.
          </p>

          <div className="mt-4 space-y-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-600 mb-1">
                Phân tích • 30 phút trước
              </p>
              <p className="text-sm font-semibold">
                Chuyên gia nhận định xu hướng kinh tế khu vực Đông Nam Á 2026.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-sky-600 mb-1">
                Công nghệ • 1 giờ trước
              </p>
              <p className="text-sm font-semibold">
                AI đang thay đổi cách chúng ta tiếp cận và xử lý thông tin mỗi ngày.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-6 text-sm text-slate-600">
            <div>
              <p className="text-xl font-semibold text-emerald-600">5 phút</p>
              <p>để cài đặt nguồn tin cá nhân</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-emerald-600">Miễn phí</p>
              <p>cho tài khoản cơ bản</p>
            </div>
          </div>
        </div>

        {/* RIGHT – REGISTER FORM */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-7 sm:p-9">
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
              Tạo tài khoản mới ✨
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Đăng ký để lưu bài viết, theo dõi chủ đề và nhận tin cá nhân hoá.
            </p>
          </div>

          {formError && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-2">
              {formError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* NAME */}
            <div>
              <label
                htmlFor="signup-name"
                className="block text-sm font-medium text-slate-800 mb-2"
              >
                Họ và tên
              </label>
              <input
                id="signup-name"
                name="fullname"
                type="text"
                placeholder="Nguyễn Văn A"
                className={`w-full rounded-2xl bg-slate-50 border px-4 py-3 text-base outline-none focus:ring-2 transition ${
                  errors.fullname
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-200"
                }`}
                value={form.fullname}
                onChange={handleChange}
              />
              {errors.fullname && (
                <p className="mt-1 text-xs text-red-500">{errors.fullname}</p>
              )}
            </div>

            {/* USERNAME */}
            <div>
              <label
                htmlFor="signup-username"
                className="block text-sm font-medium text-slate-800 mb-2"
              >
                Username
              </label>
              <input
                id="signup-username"
                name="username"
                type="text"
                placeholder="Ít nhất 6 ký tự"
                className={`w-full rounded-2xl bg-slate-50 border px-4 py-3 text-base outline-none focus:ring-2 transition ${
                  errors.username
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-200"
                }`}
                value={form.username}
                onChange={handleChange}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-slate-800 mb-2"
              >
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className={`w-full rounded-2xl bg-slate-50 border px-4 py-3 text-base outline-none focus:ring-2 transition ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-200"
                }`}
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* DOB */}
            <div>
              <label
                htmlFor="signup-dob"
                className="block text-sm font-medium text-slate-800 mb-2"
              >
                Ngày sinh
              </label>
              <input
                id="signup-dob"
                name="dob"
                type="date"
                className={`w-full rounded-2xl bg-slate-50 border px-4 py-3 text-base outline-none focus:ring-2 transition ${
                  errors.dob
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-200"
                }`}
                value={form.dob}
                onChange={handleChange}
              />
              {errors.dob && (
                <p className="mt-1 text-xs text-red-500">{errors.dob}</p>
              )}
            </div>

            {/* PASSWORD + EYE */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-slate-800 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ít nhất 6 ký tự"
                  className={`w-full rounded-2xl bg-slate-50 border px-4 py-3 pr-14 text-base outline-none focus:ring-2 transition ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-200"
                  }`}
                  value={form.password}
                  onChange={handleChange}
                />
                {form.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <span>
                      {showPassword ? (
                        // eye-off
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
                        // eye-on
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

            {/* CONFIRM PASSWORD + EYE */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-sm font-medium text-slate-800 mb-2"
              >
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full rounded-2xl bg-slate-50 border px-4 py-3 pr-14 text-base outline-none focus:ring-2 transition ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-200"
                  }`}
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                {form.confirmPassword && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label={
                      showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                  >
                    <span>
                      {showConfirmPassword ? (
                        // eye-off
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
                        // eye-on
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
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* TERMS */}
            <div className="flex items-start text-sm gap-3">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  name="acceptTerms"
                  type="checkbox"
                  className="mt-[3px] h-4 w-4 rounded border-slate-400 text-emerald-600 focus:ring-emerald-500"
                  checked={form.acceptTerms}
                  onChange={handleChange}
                />
                <span className="text-slate-600">
                  Tôi đồng ý với{" "}
                  <button
                    type="button"
                    className="text-emerald-600 hover:text-emerald-500"
                  >
                    Điều khoản sử dụng
                  </button>{" "}
                  và{" "}
                  <button
                    type="button"
                    className="text-emerald-600 hover:text-emerald-500"
                  >
                    Chính sách bảo mật
                  </button>
                  .
                </span>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="mt-1 text-xs text-red-500">{errors.acceptTerms}</p>
            )}

            <div className="text-sm text-slate-500 text-right">
              Đã có tài khoản?{" "}
              <NavLink
                to="/login"
                className="text-emerald-600 hover:text-emerald-500 font-medium"
              >
                Đăng nhập
              </NavLink>
            </div>

            <button
              type="submit"
              className="w-full mt-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 text-base transition shadow-md"
            >
              Tạo tài khoản
            </button>
          </form>

          <p className="mt-5 text-xs text-slate-500 leading-relaxed">
            Bằng việc tiếp tục, bạn đồng ý với điều khoản và chính sách của NewsPulse.
          </p>
        </div>
      </div>
    </div>
  );
}
