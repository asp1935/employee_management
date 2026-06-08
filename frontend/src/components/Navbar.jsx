import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../redux/userSlice";
import api from "../api/api";
import { LogOut } from "lucide-react";
import { clearAccessToken } from "../auth/authToken";

function Navbar() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user.user);
  const API_IMG_URL = import.meta.env.VITE_API_IMG_URL;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      clearAccessToken();
      dispatch(clearUser());
      // window.location.href = "/";
    }
  };

  return (
    <header className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex justify-between items-center gap-2">
        
        <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-800 tracking-wide whitespace-nowrap flex-shrink-0">
          Employee Management
        </h1>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src={
                  user.role === "employee" && user.profilePhotoUrl
                    ? `${API_IMG_URL}/${user.profilePhotoUrl}`
                    : "/avatar.jpg"
                }
                alt="avatar"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-300 flex-shrink-0"
                onError={(e) => (e.target.src = "/avatar.jpg")}
              />

              <div className="leading-tight hidden sm:block">
                <p className="text-sm font-medium text-gray-800 truncate max-w-[120px] md:max-w-none">
                  {user.name}
                </p>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 text-xs font-semibold rounded-full capitalize
                    ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-700"
                        : user.role === "manager"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-2 bg-red-500 text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition shadow-sm flex-shrink-0"
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;