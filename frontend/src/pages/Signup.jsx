import React, { useState } from "react";
import { User, Mail, Lock, Key, Image as ImgIcon } from "lucide-react";
import api from "../api/api";
import { useNavigate } from "react-router";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    adminAccessKey: "",
    profilePhoto: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (form.role === "manager" && !form.email.endsWith("@company.com")) {
      setError("Manager email must end with @company.com");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("password", form.password);
      data.append("role", form.role);
      if (form.role === "admin") data.append("adminAccessKey", form.adminAccessKey);
      if (form.role === "employee" && form.profilePhoto) data.append("profilePhoto", form.profilePhoto);

      const res = await api.post("/auth/signup", data);
      if (res.data.success || res.status === 200) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setError(res.data.message || "Signup failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
        <p className="text-gray-600 mb-6">Join our platform today</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Role</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value, email: "", adminAccessKey: "", profilePhoto: null })}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email {form.role === "manager" && <span className="text-xs text-gray-500">(must end with @company.com)</span>}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder={form.role === "manager" ? "name@company.com" : "your.email@example.com"}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          {form.role === "admin" && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Admin Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter admin key"
                  value={form.adminAccessKey}
                  onChange={(e) => setForm({ ...form, adminAccessKey: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {form.role === "employee" && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Profile Photo</label>
              <div className="relative">
                <ImgIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="file"
                  accept="image/*"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  onChange={(e) => setForm({ ...form, profilePhoto: e.target.files[0] })}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-200 disabled:bg-gray-400"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/" className="text-purple-600 font-semibold hover:underline">
            Sign In
          </a> 
        </p>
      </div>
    </div>
  );
}


export default Signup