"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import useEvent from "../../../../hooks/useEvent";
import AutoImageSlider from "@/components/AutoImageSlider";


// Skeleton Loader Component
const EventCardSkeleton = () => (
    <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-[280px] flex-shrink-0 overflow-hidden rounded-xl bg-cards shadow sm:w-[320px]"
    >
        <div className="h-40 w-full bg-gray-200" />
        <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 bg-gray-200 rounded-full w-16" />
                ))}
            </div>
        </div>
    </motion.div>
);

export default function Event({ embedded = false } = {}) {
    const { createEvent, getAllEvents, updateEvent, deleteEvent } = useEvent();
    const [removedImages, setRemovedImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    // React Query data
    const { data: event = [] } = getAllEvents;

    const [formOpen, setFormOpen] = useState(false);
    const [editEventId, setEditEventId] = useState(null);

    const emptyEvent = {
        name: "",
        images: [], // { file, preview }
        isActive: true,
    };

    const [eventForm, setEventForm] = useState(emptyEvent);

    /* ---------------- IMAGE HANDLERS ---------------- */

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setEventForm((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
        }));

        e.target.value = "";
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(eventForm.images[index].preview);

        setEventForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    /* ---------------- FORM HANDLERS ---------------- */

    const resetFormState = () => {
        setFormOpen(false);
        setEditEventId(null);
        setEventForm(emptyEvent);
        setExistingImages([]);
        setRemovedImages([]);
    };

    const handleAdd = () => {
        resetFormState();
        setFormOpen(true);
    };

    const handleEdit = (event) => {
        setEditEventId(event.id);

        setExistingImages(event.images || []);
        setRemovedImages([]);

        setEventForm({
            name: event.name,
            images: [], // new images only
            isActive: event.isActive,
        });

        setFormOpen(true);
    };

    const removeExistingImage = (index) => {
        const img = existingImages[index];

        setRemovedImages((prev) => [...prev, img]);

        setExistingImages((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this event?")) return;
        await deleteEvent.mutateAsync(id);
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            formData.append("name", eventForm.name);
            if (typeof eventForm.isActive === "boolean") {
                formData.append("isActive", eventForm.isActive.toString());
            }

            formData.append(
                "event",
                JSON.stringify(
                    eventForm.event
                        .split(",")
                        .map((a) => a.trim())
                        .filter(Boolean)
                )
            );

            // ADD MODE
            if (!editEventId) {
                eventForm.images.forEach((img) => {
                    formData.append("images", img.file);
                });

                await createEvent.mutateAsync(formData);
            }
            // EDIT MODE
            else {
                formData.append("removedImages", JSON.stringify(removedImages));

                eventForm.images.forEach((img) => {
                    formData.append("images", img.file);
                });

                await updateEvent.mutateAsync({
                    eventId: editEventId,
                    eventData: formData,
                });
            }

            // RESET
            resetFormState();

        } catch (error) {
            console.error("event save failed", error);
        }
    };

    /* ---------------- UI ---------------- */

    return (
        <div className={embedded ? "w-full" : "min-h-screen bg-bgColor px-4 pt-14 sm:px-8"}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={
                    embedded
                        ? "mb-4 flex items-center justify-end"
                        : "mb-6 flex items-center justify-between"
                }
            >
                {!embedded && (
                    <h1 className="text-2xl font-bold text-primaryLite">Manage Event</h1>
                )}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdd}
                    className="bg-buttons cursor-pointer text-white px-5 py-2 rounded-xl"
                >
                    + Add Event
                </motion.button>
            </motion.div>

            {/* event LIST */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`flex gap-6 overflow-x-auto pb-3 scroll-smooth no-scrollbar overscroll-x-contain ${embedded ? "-mx-4 px-4 sm:-mx-6 sm:px-6" : ""}`}
            >
                <AnimatePresence mode="wait">
                    {getAllEvents.isLoading ? (
                        // Skeleton loaders
                        <>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <EventCardSkeleton key={`skeleton-${i}`} />
                            ))}
                        </>
                    ) : event.length === 0 ? (
                        // Empty state
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="min-w-full py-12 text-center"
                        >
                            <Icon icon="mdi:home-outline" width="48" height="48" className="mx-auto mb-4 text-gray-400" />
                            <p className="text-center text-gray-500">
                                No Event available
                            </p>
                        </motion.div>
                    ) : (
                        // event cards
                        event.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -8, boxShadow: "0 12px 24px rgba(0,0,0,0.15)" }}
                                className="w-[280px] flex-shrink-0 overflow-hidden rounded-xl bg-cards shadow sm:w-[320px]"
                            >
                                <motion.div
                                    className="overflow-hidden"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <AutoImageSlider
                                        images={event.images}
                                        alt={event.name}
                                        className="h-56 w-full object-cover"
                                    />
                                </motion.div>

                                <div className="p-4">
                                    <h3 className="font-semibold text-lg">{event.name}</h3>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleEdit(event)}
                                        >
                                            <Icon
                                                icon="mdi:pencil"
                                                className="w-5 h-5 text-primaryLite cursor-pointer"
                                            />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDelete(event.id)}
                                        >
                                            <Icon
                                                icon="mdi:delete"
                                                className="w-5 h-5 text-red-500 cursor-pointer"
                                            />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>

            {/* MODAL */}
            <AnimatePresence mode="wait">
                {formOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white w-full max-w-md p-6 rounded-xl max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="font-semibold text-lg mb-4">
                                {editEventId ? "Edit event" : "Add event"}
                            </h2>

                            {[
                                ["name", "event Name"],
                            ].map(([key, label], idx) => (
                                <motion.input
                                    key={key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    placeholder={label}
                                    value={eventForm[key]}
                                    onChange={(e) =>
                                        setEventForm({ ...eventForm, [key]: e.target.value })
                                    }
                                    className="w-full mb-3 px-4 py-2 border rounded-xl"
                                />
                            ))}

                            {/* EXISTING IMAGES (EDIT MODE ONLY) */}
                            <AnimatePresence>
                                {existingImages.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-6 gap-2 mb-4"
                                    >
                                        {existingImages.map((img, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.9, opacity: 0 }}
                                                className="relative group border rounded-lg overflow-hidden"
                                            >
                                                <img
                                                    src={img}
                                                    alt="Existing"
                                                    className="h-16 w-16 object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index)}
                                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-1
                                   opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    ✕
                                                </button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* NORMAL FILE INPUT */}
                            <motion.input
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className={`w-full mb-2 px-4 py-2 cursor-pointer
                file:mr-4 file:py-2 file:px-4
                file:border-0 file:rounded-lg
                file:bg-buttons file:text-white`}
                            />

                            {/* IMAGE COUNT */}
                            <AnimatePresence>
                                {eventForm.images.length > 0 && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-sm text-buttons font-medium mb-2"
                                    >
                                        {eventForm.images.length} image(s)
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            {/* IMAGE PREVIEW */}
                            <AnimatePresence>
                                {eventForm.images.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-6 gap-[1px] mb-4"
                                    >
                                        {eventForm.images.map((img, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="relative w-15 rounded-lg overflow-hidden border group"
                                            >
                                                <img
                                                    src={img.preview}
                                                    alt="Preview"
                                                    className="h-15 w-15"
                                                />
                                                <motion.button
                                                    type="button"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-black/50 text-red
                                 rounded-full p-1 text-xs
                                 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    ✕
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-end gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={resetFormState}
                                    className="px-4 py-2 border rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSubmit}
                                    disabled={createEvent.isPending || updateEvent.isPending}
                                    className="px-4 py-2 bg-buttons text-white rounded-xl cursor-pointer disabled:opacity-70"
                                >
                                    {createEvent.isPending || updateEvent.isPending ? "Saving..." : "Save"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
