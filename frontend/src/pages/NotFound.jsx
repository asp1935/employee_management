import React from "react";
import { Link } from "react-router";

function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="mb-6">Page not found</p>
                <Link to="/admin" className="text-blue-600">Go home</Link>
            </div>
        </div>
    );
}

export default NotFound;
