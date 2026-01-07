"use client";

import { useEffect, useState } from "react";
import { AUTH_EVENT } from "@/utils/authEvents";
import Link from "next/link";
import { FaRegBell } from "react-icons/fa";
import LoginModal from "./LoginModal";
import { getPermissions } from "@/lib/permissions";
import { useAuth } from "@/hooks/useUser";
import { useAdminBookings } from "../hooks/useBook";
import { motion } from "framer-motion";

export default function Header() {
    const [open, setOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [loginStatus, setLoginStatus] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { logout } = useAuth();
    const permissions = getPermissions(userInfo);
    const isAdminLoggedIn = loginStatus && permissions.admin;

    const {
        getAllBookingsAndHoldings
    } = useAdminBookings({
        enabledUpcoming: isAdminLoggedIn,
        enabledHistory: false,
    });

    const syncAuth = () => {
        const storedUser = localStorage.getItem("userInfo");
        setUserInfo(storedUser ? JSON.parse(storedUser) : null);
        setLoginStatus(!!localStorage.getItem("userInfo"));
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }

        syncAuth();
        setIsLoading(false);
        window.addEventListener(AUTH_EVENT, syncAuth);
        return () => window.removeEventListener(AUTH_EVENT, syncAuth);
    }, []);

    const handleLogout = async () => {
        try {
            await logout.mutateAsync();
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <>
            <header className="flex h-16 gap-10 justify-between items-center px-3 fixed top-0 w-full bg-teritaryLite shadow z-50">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="font-[var(--font-heading)] text-2xl font-bold text-primaryLite"
                >
                    SRK Luxe Resort
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex items-center gap-2"
                >
                    {permissions.admin && (
                        <div className="relative">
                            <Link href="/admin-panel/bookings">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="cursor-pointer relative p-2 rounded-[16px] border-[2px] border-secondaryLite"
                                >
                                    <FaRegBell className="text-secondaryLite" />
                                </motion.button>
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="absolute -top-1 -right-1 bg-red text-secondaryLite text-[10px] px-[6px] py-[2px] rounded-[16px]"
                                >
                                    {getAllBookingsAndHoldings?.data?.count || 0}
                                </motion.span>
                            </Link>
                        </div>
                    )}

                    {isLoading ? (
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-12 h-12 rounded-full bg-gray-300"
                        />
                    ) : loginStatus ? (
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowDropdown(prev => !prev)}
                                className="cursor-pointer flex items-center"
                            >
                                <motion.img
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    src={
                                        userInfo?.image ||
                                        `https://avatar.iran.liara.run/username?username=${userInfo?.name}`
                                    }
                                    className="w-12 h-12 rounded-full border-2 border-secondaryLite"
                                />
                            </motion.button>
                        </div>
                    ) : (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setOpen(true)}
                            className="px-6 py-2 rounded-full bg-buttons text-white"
                        >
                            Login
                        </motion.button>
                    )}
                </motion.div>

                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onMouseLeave={() => setShowDropdown(false)}
                        className="absolute right-3 top-16 w-52 bg-cards rounded-xl shadow-xl border flex flex-col"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="px-4 py-3 font-semibold border-b"
                        >
                            {userInfo?.name}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                        >
                            <Link href="/profile" className="px-4 py-2 hover:bg-grayLite block">
                                Profile
                            </Link>
                        </motion.div>

                        {permissions.admin && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Link href="/admin-panel" className="px-4 py-2 hover:bg-grayLite block">
                                    Admin Panel
                                </Link>
                            </motion.div>
                        )}

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-xl hover:bg-grayLite text-left"
                        >
                            Logout
                        </motion.button>
                    </motion.div>
                )}
            </header>

            {open && <LoginModal close={() => setOpen(false)} />}
        </>
    );
}
