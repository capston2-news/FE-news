// EmployeeModal.jsx
import { useEffect, useState } from "react";

const initialFormValues = {
  employeeId: null,
  fullname: "",
  username: "",
  email: "",
  birthDate: "",
  age: "",
  password: "",
  confirmPassword: "",
  is_deleted: "false",
  is_active: "true",
};

const cleanSpaces = (s) => String(s ?? "").trim().replace(/\s+/g, " ");

const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email ?? "").trim());

const isValidFullName = (name) => {
  const n = cleanSpaces(name);
  if (!n) return false;
  const parts = n.split(" ");
  if (parts.length < 2) return false;

  const wordRe = /^[\p{L}]+(?:[-'’][\p{L}]+)*$/u;
  return parts.every((w) => wordRe.test(w));
};

const calcAgeFromBirthDate = (birthDateStr) => {
  if (!birthDateStr) return "";
  const dob = new Date(birthDateStr);
  if (isNaN(dob.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age < 0 ? "" : String(age);
};

const isAtLeast18 = (birthDateStr) => {
  const dob = new Date(birthDateStr);
  if (isNaN(dob.getTime())) return false;
  const today = new Date();
  const limit = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return dob <= limit;
};

function EmployeeModal({ isOpen, onClose, currentEmployee, onSubmit }) {
  const isEdit = !!(currentEmployee?.employeeId || currentEmployee?._id);

  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (currentEmployee) {
      setFormValues({
        employeeId: currentEmployee.employeeId || currentEmployee._id || null,
        fullname: currentEmployee.fullName || currentEmployee.fullname || "",
        username: currentEmployee.username || "",
        email: currentEmployee.email || "",
        birthDate: currentEmployee.birthDate
            ? new Date(currentEmployee.birthDate).toISOString().split("T")[0]
            : "",
        age: currentEmployee.age != null ? String(currentEmployee.age) : "",
        password: "",
        confirmPassword: "",
        is_deleted: String(!!(currentEmployee.is_deleted ?? false)),
        is_active: String(!!(currentEmployee.is_active ?? true)),
      });
    } else {
      setFormValues(initialFormValues);
    }

    setErrors({});
    setTouched({});
  }, [isOpen, currentEmployee]);

  const validateField = (name, values) => {
    const fullname = cleanSpaces(values.fullname);
    const username = cleanSpaces(values.username);
    const email = String(values.email ?? "").trim();
    const birthDate = values.birthDate;
    const ageNum = Number(values.age);

    if (name === "fullname") {
      if (!fullname) return "Vui lòng nhập họ và tên.";
      if (!isValidFullName(fullname)) return "Họ và tên phải đầy đủ (ít nhất 2 từ) và chỉ gồm chữ.";
      return null;
    }

    if (name === "username") {
      if (!username) return "Vui lòng nhập tên đăng nhập.";
      return null;
    }

    if (name === "email") {
      if (!email) return "Vui lòng nhập email.";
      if (!isValidEmail(email)) return "Email không đúng định dạng.";
      return null;
    }

    // các field dưới đây chỉ dùng khi tạo mới
    if (!isEdit && name === "birthDate") {
      if (!birthDate) return "Vui lòng chọn ngày sinh.";
      const dob = new Date(birthDate);
      if (isNaN(dob.getTime())) return "Ngày sinh không hợp lệ.";
      if (dob > new Date()) return "Ngày sinh không được lớn hơn hôm nay.";
      if (!isAtLeast18(birthDate)) return "Nhân viên phải từ 18 tuổi trở lên.";
      return null;
    }

    if (!isEdit && name === "age") {
      if (!values.age) return "Không tính được tuổi từ ngày sinh.";
      if (Number.isNaN(ageNum)) return "Tuổi không hợp lệ.";
      if (ageNum < 18) return "Tuổi phải từ 18 trở lên.";
      if (ageNum > 120) return "Tuổi không hợp lệ.";
      return null;
    }

    if (!isEdit && name === "password") {
      if (!values.password) return "Vui lòng nhập mật khẩu.";
      if (values.password.length < 8) return "Mật khẩu tối thiểu 8 ký tự.";
      return null;
    }

    if (!isEdit && name === "confirmPassword") {
      if (!values.confirmPassword) return "Vui lòng nhập lại mật khẩu.";
      if (values.confirmPassword !== values.password) return "Mật khẩu nhập lại không khớp.";
      return null;
    }

    return null;
  };

  const showError = (field) => touched[field] && errors[field];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));

    setFormValues((prev) => {
      const next = { ...prev, [name]: value };

      // chỉ cần cho create (edit đang ẩn birthDate/age)
      if (!isEdit && name === "birthDate") {
        next.age = calcAgeFromBirthDate(value);
        setTouched((t) => ({ ...t, age: true, birthDate: true }));
      }

      setErrors((prevErr) => {
        const clone = { ...prevErr };

        const err = validateField(name, next);
        if (err) clone[name] = err;
        else delete clone[name];

        if (!isEdit && name === "birthDate") {
          const errAge = validateField("age", next);
          if (errAge) clone.age = errAge;
          else delete clone.age;
        }

        if (!isEdit && (name === "password" || name === "confirmPassword")) {
          const errP = validateField("password", next);
          const errCP = validateField("confirmPassword", next);
          if (errP) clone.password = errP;
          else delete clone.password;
          if (errCP) clone.confirmPassword = errCP;
          else delete clone.confirmPassword;
        }

        return clone;
      });

      return next;
    });
  };

  const validateAll = (values) => {
    const fields = isEdit
        ? ["fullname", "username", "email"]
        : ["fullname", "username", "email", "birthDate", "age", "password", "confirmPassword"];

    const nextErrors = {};
    for (const f of fields) {
      const err = validateField(f, values);
      if (err) nextErrors[f] = err;
    }
    return nextErrors;
  };

  const handleInternalSubmit = (e) => {
    e.preventDefault();

    const touchAll = isEdit
        ? { fullname: true, username: true, email: true }
        : {
          fullname: true,
          username: true,
          email: true,
          birthDate: true,
          age: true,
          password: true,
          confirmPassword: true,
        };

    setTouched(touchAll);

    const allErr = validateAll(formValues);
    setErrors(allErr);
    if (Object.keys(allErr).length > 0) return;

    // ✅ payload
    const payload = isEdit
        ? {
          employeeId: formValues.employeeId || undefined,
          fullname: cleanSpaces(formValues.fullname),
          username: cleanSpaces(formValues.username),
          email: String(formValues.email).trim(),
        }
        : {
          employeeId: formValues.employeeId || undefined,
          fullname: cleanSpaces(formValues.fullname),
          username: cleanSpaces(formValues.username),
          email: String(formValues.email).trim(),
          age: Number(formValues.age),
          role: "employee",
          password: formValues.password,
          is_deleted: formValues.is_deleted === "true",
          is_active: formValues.is_active === "true",
        };

    if (!payload.employeeId) delete payload.employeeId;

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            {isEdit ? "Chỉnh sửa nhân viên" : "Thêm mới nhân viên"}
          </h2>

          <form className="space-y-4" onSubmit={handleInternalSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                  name="fullname"
                  value={formValues.fullname}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                      showError("fullname") ? "border-red-500" : "focus:border-blue-500"
                  }`}
                  placeholder="Đặng Hải Phú Nguyên"
              />
              {showError("fullname") && <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
              <input
                  name="username"
                  value={formValues.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                      showError("username") ? "border-red-500" : "focus:border-blue-500"
                  }`}
              />
              {showError("username") && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                      showError("email") ? "border-red-500" : "focus:border-blue-500"
                  }`}
                  placeholder="nguyen@gmail.com"
              />
              {showError("email") && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* ✅ Khi tạo mới mới hiện các field dưới */}
            {!isEdit && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                    <input
                        name="password"
                        type="password"
                        value={formValues.password}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg ${
                            showError("password") ? "border-red-500" : "focus:border-blue-500"
                        }`}
                        placeholder="Tối thiểu 8 ký tự"
                    />
                    {showError("password") && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
                    <input
                        name="confirmPassword"
                        type="password"
                        value={formValues.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg ${
                            showError("confirmPassword") ? "border-red-500" : "focus:border-blue-500"
                        }`}
                    />
                    {showError("confirmPassword") && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                    <input
                        name="birthDate"
                        type="date"
                        value={formValues.birthDate}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg ${
                            showError("birthDate") ? "border-red-500" : "focus:border-blue-500"
                        }`}
                    />
                    {showError("birthDate") && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tuổi (tự tính)</label>
                    <input
                        name="age"
                        readOnly
                        value={formValues.age}
                        className={`w-full px-3 py-2 border rounded-lg bg-gray-100 ${
                            showError("age") ? "border-red-500" : ""
                        }`}
                    />
                    {showError("age") && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                  </div>
                </>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setErrors({});
                    setTouched({});
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>

              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}

export default EmployeeModal;
