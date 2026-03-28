"use client";

import { motion } from "framer-motion";
import ManageRooms from "./rooms/page";
import Amenities from "./amenities/page";
import NearbyPlaces from "./nearbyPlaces/page";
import Events from "./event/page";

export default function AdminPanel() {

    return (
        <div className="h-screen overflow-y-auto bg-bgColor px-4 pb-12 sm:px-8 scroll-smooth">
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mx-auto w-full max-w-7xl py-6"
            >
                <div className="sticky top-0 z-10 -mx-4 border-b border-white/10 bg-bgColor px-4 py-4 sm:-mx-8 sm:px-8">
                    <h1 className="text-2xl font-bold text-primaryLite">Settings</h1>
                </div>

                <div className="mt-6 flex flex-col gap-10">
                    <section id="rooms" className="rounded-2xl bg-cards p-4 shadow-sm ring-1 ring-white/10 sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-primaryLite">Rooms</h2>
                        </div>
                        <ManageRooms embedded />
                    </section>

                    <section id="amenities" className="rounded-2xl bg-cards p-4 shadow-sm ring-1 ring-white/10 sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-primaryLite">Amenities</h2>
                        </div>
                        <Amenities embedded />
                    </section>

                    <section id="nearby-places" className="rounded-2xl bg-cards p-4 shadow-sm ring-1 ring-white/10 sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-primaryLite">Nearby Places</h2>
                        </div>
                        <NearbyPlaces embedded />
                    </section>

                    <section id="events" className="rounded-2xl bg-cards p-4 shadow-sm ring-1 ring-white/10 sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-primaryLite">Events</h2>
                        </div>
                        <Events embedded />
                    </section>
                </div>
            </motion.div>
        </div>
    );
}
