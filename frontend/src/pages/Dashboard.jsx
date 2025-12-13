import React from "react";
import { useSelector } from "react-redux";
import { LogOut } from "lucide-react";
import api from "../api/api";
import { useDispatch } from "react-redux";
import { clearUser } from "../redux/userSlice";
import Navbar from "../components/Navbar";
import { clearAccessToken } from "../auth/authToken";

function Dashboard() {
    const user = useSelector((s) => s.user.user);
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            await api.post("/users/logout");
        } catch (err) {
            console.error(err);
        } finally {
            clearAccessToken();
            dispatch(clearUser());
            window.location.href = "/";
        }
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
                            <p className="text-gray-600">You're logged in as <span className="font-semibold text-teal-600">{user?.role}</span></p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>

                    <div className="bg-gradient-to-r from-teal-500 to-green-500 rounded-xl p-6 text-white mb-6">
                        <h2 className="text-2xl font-bold mb-2">Hello, {user?.name}!</h2>
                        <p className="text-teal-50">Email: {user?.email}</p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Dashboard;
