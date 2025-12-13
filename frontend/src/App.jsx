/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import api from "./api/api";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadCurrent = async () => {
      try {
        const res = await api.get("/users/current");
        const user = res.data?.data?.user;
        if (user) dispatch(setUser(user));
      } catch (err) {
        dispatch(clearUser());
      }
    };

    loadCurrent();
  }, []);


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />



        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}