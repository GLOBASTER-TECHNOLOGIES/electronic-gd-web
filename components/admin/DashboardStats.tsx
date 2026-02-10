"use client";
import React from 'react';
import { FaChartBar, FaUsers, FaClock, FaExclamationTriangle } from "react-icons/fa";

export default function DashboardStats() {
    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back, Administrator. Here is what&apos; happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Officers Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">
                        <FaUsers size={24} />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Personnel</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">1,248</p>
                    </div>
                </div>

                {/* Active Shifts Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                        <FaClock size={24} />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Active Shifts</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">450</p>
                    </div>
                </div>

                {/* System Alerts Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                        <FaExclamationTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">System Alerts</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
                    </div>
                </div>
            </div>

            {/* Helpful Hint */}
            <div className="mt-12 bg-blue-50 border border-blue-100 p-6 rounded-xl text-center">
                <p className="text-blue-700 font-medium">
                    Select an option from the sidebar to manage officer records or register new personnel.
                </p>
            </div>
        </div>
    );
}