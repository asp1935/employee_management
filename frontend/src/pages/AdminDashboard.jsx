/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import api from "../api/api";
import Navbar from "../components/Navbar";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [newRole, setNewRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const API_IMG_URL=import.meta.env.VITE_API_IMG_URL;

    const getApiError = (err) => {
        return (
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Something went wrong"
        );
    };


    const fetchUsers = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await api.get("/users");
            setUsers(res.data.data.users || []);
        } catch (err) {
            setErrorMsg(getApiError(err));
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchUsers();
    }, []);

    const updateRole = async (id) => {
        if (!newRole) {
            setErrorMsg("Please select a role");
            return;
        }

        try {
            setErrorMsg("");
            await api.patch(`/users/${id}/role`, { role: newRole });
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            setErrorMsg(getApiError(err));
        }
    };


    const toggleStatus = async (id, status) => {
        try {
            setErrorMsg("");
            const newStatus = status === "active" ? "inactive" : "active";
            await api.patch(`/users/${id}/status`, { status: newStatus });
            fetchUsers();
        } catch (err) {
            setErrorMsg(getApiError(err));
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure?")) return;

        try {
            setErrorMsg("");
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) {
            setErrorMsg(getApiError(err));
        }
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                                <p className="text-gray-600 mt-1">Manage all users</p>
                            </div>
                        </div>
                    </div>
                    {errorMsg && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {errorMsg}
                        </div>
                    )}


                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Profile</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users?.map((u) => (
                                        <tr key={u._id} className="hover:bg-gray-50 transition duration-150">

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <img
                                                    src={
                                                        u.role === "employee" && u.profilePhotoUrl
                                                            ? API_IMG_URL+"/"+u.profilePhotoUrl
                                                            : "/avatar.jpg"
                                                    }
                                                    alt="avatar"
                                                    className="w-10 h-10 rounded-full object-cover border"
                                                    // onError={(e) => {
                                                    //     e.target.src = "/avatar.png";
                                                    // }}
                                                />
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{u.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-600">{u.email}</div>
                                            </td>
                                            
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {editingUser === u._id ? (
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                            value={newRole}
                                                            onChange={(e) => setNewRole(e.target.value)}
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="employee">Employee</option>
                                                            <option value="manager">Manager</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                        <button onClick={() => updateRole(u._id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                                                            Save
                                                        </button>
                                                        <button onClick={() => setEditingUser(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                        {u.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap relative">
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={u.status === "active"}
                                                        onChange={() => toggleStatus(u._id, u.status)}
                                                    />

                                                    {/* Switch background */}
                                                    <div
                                                        className={`relative w-11 h-6 rounded-full transition-colors duration-200
            ${u.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
                                                    >
                                                        {/* Switch knob */}
                                                        <span
                                                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200
                ${u.status === "active" ? "translate-x-5" : ""}`}
                                                        />
                                                    </div>

                                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                                        {u.status === "active" ? "Active" : "Inactive"}
                                                    </span>
                                                </label>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser(u._id);
                                                            setNewRole(u.role);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-150"
                                                        title="Edit Role"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => deleteUser(u._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-150" title="Delete User">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {users.length === 0 && (
                                <div className="text-center py-12 text-gray-500">No users found</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;