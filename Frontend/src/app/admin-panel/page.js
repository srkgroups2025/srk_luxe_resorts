"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { useAdminDashboard } from "@/hooks/useAdminDashboard"; // your custom hook
import { toast } from "sonner";

// Skeleton Components
const CardSkeleton = () => (
    <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="bg-gray-200 p-6 rounded-xl h-32"
    />
);

const StatCardSkeleton = () => (
    <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="bg-cards p-6 rounded-2xl shadow space-y-3"
    >
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
    </motion.div>
);

const ChartSkeleton = () => (
    <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-full h-64 bg-gray-200 rounded-xl"
    />
);

export default function AdminPanel() {
    const currentMonth = new Date().getMonth(); // 0–11
    const currentYear = new Date().getFullYear();

    const [view, setView] = useState("monthly"); // monthly | yearly | overall
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [showDropdown, setShowDropdown] = useState(false);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = [2025, 2026, 2027, 2028, 2029, 2030];

    // ✅ Fetch analytics from backend
    const { data, isLoading, error } = useAdminDashboard({
        view,
        month: selectedMonth,
        year: selectedYear,
    });

    if (error) toast.error("Failed to load analytics");

    // ✅ Map chart data correctly
    const chartData = useMemo(() => data?.data || [], [data]);

    // ✅ Month summary
    const monthSummary = useMemo(() => ({
        totalBookings: data?.totalBookings || 0,
        totalAmount: data?.totalAmount || 0
    }), [data]);

    // ✅ Year summary
    const yearSummary = useMemo(() => ({
        totalBookings: data?.yearSummary?.totalBookings || 0,
        totalAmount: data?.yearSummary?.totalAmount || 0
    }), [data]);

    // total customers and bookings
    const overallStats = useMemo(() => ({
        totalCustomers: data?.totalCustomersCount || 0,
        totalBookings: data?.totalBookingsCount || 0,
    }), [data]);

    return (
        <div className="min-h-screen bg-bgColor px-4 pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center p-10 pb-10 sm:px-8"
            >
                <h1 className="text-3xl font-bold text-primaryLite">
                    Admin Dashboard
                </h1>
            </motion.div>

            {/* Rooms & Booking */}
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
                <Link href="/admin-panel/rooms">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
                        className="bg-cards p-6 rounded-xl shadow cursor-pointer"
                    >
                        <Icon icon="mdi:bed-king-outline" className="w-10 h-10 mb-3 text-primaryLite" />
                        <h3 className="font-semibold text-lg">Manage Rooms</h3>
                        <p className="text-sm text-grayDark">Add, edit or remove rooms</p>
                    </motion.div>
                </Link>

                <Link href="/admin-panel/bookings">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
                        className="bg-cards p-6 rounded-xl shadow cursor-pointer"
                    >
                        <Icon icon="mdi:calendar-check" className="w-10 h-10 mb-3 text-primaryLite" />
                        <h3 className="font-semibold text-lg">Bookings</h3>
                        <p className="text-sm text-grayDark">View all bookings</p>
                    </motion.div>
                </Link>
            </div>

            {/* Graph Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-cards p-6 rounded-xl shadow mb-8"
            >
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-lg font-semibold">Booking Analytics</h2>

                    {/* View Toggle */}
                    <div className="relative flex gap-2">
                        {/* MONTHLY */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setView("monthly");
                                setShowDropdown("month");
                            }}
                            className={`px-4 py-1 rounded-full text-sm flex items-center gap-1
                                ${view === "monthly" ? "bg-buttons text-white" : "border"}`}
                        >
                            {months[selectedMonth]}
                            <Icon icon="mdi:chevron-down" className="w-4 h-4" />
                        </motion.button>

                        {/* YEARLY */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setView("yearly");
                                setShowDropdown("year");
                            }}
                            className={`px-4 py-1 rounded-full text-sm flex items-center gap-1
                                ${view === "yearly" ? "bg-buttons text-white" : "border"}`}
                        >
                            {selectedYear}
                            <Icon icon="mdi:chevron-down" className="w-4 h-4" />
                        </motion.button>

                        {/* OVERALL */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setView("overall");
                                setShowDropdown(false);
                            }}
                            className={`px-4 py-1 rounded-full text-sm
                                ${view === "overall" ? "bg-buttons text-white" : "border"}`}
                        >
                            Overall
                        </motion.button>

                        {/* MONTH DROPDOWN */}
                        <AnimatePresence>
                            {showDropdown === "month" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-10 left-0 bg-white shadow rounded-xl p-2 z-10"
                                >
                                    {months.map((m, index) => (
                                        <motion.button
                                            key={m}
                                            whileHover={{ backgroundColor: "#f3f4f6" }}
                                            onClick={() => {
                                                setSelectedMonth(index);
                                                setShowDropdown(false);
                                            }}
                                            className={`block px-4 py-1 text-sm w-full text-left
                                                ${selectedMonth === index ? "font-semibold" : ""}`}
                                        >
                                            {m}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* YEAR DROPDOWN */}
                        <AnimatePresence>
                            {showDropdown === "year" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-10 left-20 bg-white shadow rounded-xl p-2 z-10"
                                >
                                    {years.map(y => (
                                        <motion.button
                                            key={y}
                                            whileHover={{ backgroundColor: "#f3f4f6" }}
                                            onClick={() => {
                                                setSelectedYear(y);
                                                setShowDropdown(false);
                                            }}
                                            className={`block px-4 py-1 text-sm w-full text-left
                                                ${selectedYear === y ? "font-semibold" : ""}`}
                                        >
                                            {y}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Chart */}
                <div className="w-full h-64">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <ChartSkeleton />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis yAxisId="left" orientation="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip
                                            formatter={(value, _name, props) => {
                                                const key = props.dataKey;
                                                if (key === "amount") return [`₹ ${value.toLocaleString()}`, "Revenue"];
                                                return [value, "Bookings"];
                                            }}
                                        />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="bookings"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            name="Bookings"
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#22c55e"
                                            strokeWidth={3}
                                            name="Revenue"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : (
                        <>
                            {/* MONTH SUMMARY */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                whileHover={{ y: -5 }}
                                className="bg-cards p-6 rounded-2xl shadow"
                            >
                                <h1 className="font-semibold text-center text-grayDark mb-4">
                                    Month · {months[selectedMonth]} {selectedYear}
                                </h1>
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.45 }}
                                        className="flex justify-center items-center gap-3"
                                    >
                                        <Icon icon="mdi:currency-inr" className="w-10 h-10 text-green-500" />
                                        <div>
                                            <h2 className="text-grayDark">Revenue</h2>
                                            <p className="text-xl font-bold">
                                                ₹ {monthSummary.totalAmount.toLocaleString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="flex justify-center items-center gap-3"
                                    >
                                        <Icon icon="mdi:calendar-month" className="w-10 h-10 text-indigo-500" />
                                        <div>
                                            <h2 className="text-grayDark">Bookings</h2>
                                            <p className="text-xl font-bold">
                                                {monthSummary.totalBookings}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* YEAR SUMMARY */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                whileHover={{ y: -5 }}
                                className="bg-cards p-6 rounded-2xl shadow"
                            >
                                <h1 className="font-semibold text-center text-grayDark mb-4">
                                    Year · {selectedYear}
                                </h1>
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.55 }}
                                        className="flex justify-center items-center gap-3"
                                    >
                                        <Icon icon="mdi:currency-inr" className="w-10 h-10 text-green-500" />
                                        <div>
                                            <h2 className="text-grayDark">Revenue</h2>
                                            <p className="text-xl font-bold">
                                                ₹ {yearSummary.totalAmount.toLocaleString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="flex justify-center items-center gap-3"
                                    >
                                        <Icon icon="mdi:calendar-check" className="w-10 h-10 text-indigo-500" />
                                        <div>
                                            <h2 className="text-grayDark">Bookings</h2>
                                            <p className="text-xl font-bold">
                                                {yearSummary.totalBookings}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Total customers and bookings */}
            <div className="grid sm:grid-cols-2 gap-6">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : (
                        <>
                            {/* TOTAL CUSTOMERS */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                whileHover={{ y: -5 }}
                                className="bg-cards p-6 rounded-2xl shadow"
                            >
                                <h1 className="font-semibold text-center text-grayDark mb-4">
                                    TOTAL CUSTOMERS
                                </h1>
                                <div className="flex justify-center">
                                    <motion.h1
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.65 }}
                                        className="text-3xl font-bold text-primaryLite"
                                    >
                                        {overallStats.totalCustomers}
                                    </motion.h1>
                                </div>
                            </motion.div>

                            {/* TOTAL BOOKINGS */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                                whileHover={{ y: -5 }}
                                className="bg-cards p-6 rounded-2xl shadow"
                            >
                                <h1 className="font-semibold text-center text-grayDark mb-4">
                                    TOTAL BOOKINGS
                                </h1>
                                <div className="flex justify-center">
                                    <motion.h1
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.75 }}
                                        className="text-3xl font-bold text-primaryLite"
                                    >
                                        {overallStats.totalBookings}
                                    </motion.h1>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
