"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_EVENT } from "@/utils/authEvents";
import { getPermissions } from "@/lib/permissions";
import { useAuth } from "@/hooks/useUser";
import UserAvatar from "./UserAvatar";
import { TEXT } from "@/constants/site";

const LoginModal = dynamic(() => import("./LoginModal"), {
  ssr: false,
});
const AdminBookingBadge = dynamic(() => import("./AdminBookingBadge"), {
  ssr: false,
});

export default function Header() {
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loginStatus, setLoginStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();
  const permissions = getPermissions(userInfo);
  const isAdminLoggedIn = loginStatus && permissions.admin;

  const syncAuth = () => {
    const storedUser = localStorage.getItem("userInfo");
    setUserInfo(storedUser ? JSON.parse(storedUser) : null);
    setLoginStatus(!!storedUser);
  };

  useEffect(() => {
    syncAuth();
    setIsLoading(false);
    window.addEventListener(AUTH_EVENT, syncAuth);

    return () => window.removeEventListener(AUTH_EVENT, syncAuth);
  }, []);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      setShowDropdown(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between gap-4 bg-teritaryLite px-3 shadow">
        <Link
          href="/"
          className="font-[var(--font-heading)] text-2xl font-bold text-primaryLite transition-opacity duration-200 hover:opacity-90"
        >
          {TEXT.SITE.TITLE}
        </Link>

        <div className="flex items-center gap-2">
          {isAdminLoggedIn && <AdminBookingBadge />}

          {isLoading ? (
            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-300" />
          ) : loginStatus ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex cursor-pointer items-center transition-transform duration-200 hover:scale-105"
              >
                <UserAvatar
                  name={userInfo?.name}
                  src={userInfo?.image}
                  alt={userInfo?.name || "User"}
                  className="h-12 w-12 overflow-hidden rounded-full border-2 border-secondaryLite"
                  imgClassName="object-cover"
                  fallbackClassName="bg-secondaryLite font-extrabold tracking-wide text-teritaryLite"
                />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="cursor-pointer rounded-full bg-buttons px-6 py-2 text-white transition-transform duration-200 hover:scale-[1.03]"
            >
              Login
            </button>
          )}
        </div>

        {showDropdown && (
          <div
            onMouseLeave={() => setShowDropdown(false)}
            className="absolute right-3 top-16 flex w-52 flex-col rounded-xl border bg-cards shadow-xl"
          >
            <div className="border-b px-4 py-3 font-semibold">{userInfo?.name}</div>

            <Link href="/profile" className="block px-4 py-2 hover:bg-grayLite">
              Profile
            </Link>

            {permissions.admin && (
              <Link href="/admin-panel" className="block px-4 py-2 hover:bg-grayLite">
                Admin Panel
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl px-4 py-2 text-left hover:bg-grayLite"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {open && <LoginModal close={() => setOpen(false)} />}
    </>
  );
}
