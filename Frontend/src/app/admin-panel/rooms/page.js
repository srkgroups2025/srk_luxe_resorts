"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import useRoom from "../../../hooks/useRoom";

// Skeleton Loader Component
const RoomCardSkeleton = () => (
    <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="bg-cards rounded-xl shadow overflow-hidden"
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

export default function ManageRooms() {
    const { createRoom, getAllRooms, updateRoom, deleteRoom } = useRoom();
    const [removedImages, setRemovedImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    // React Query data
    const { data: rooms = [] } = getAllRooms;

    const [formOpen, setFormOpen] = useState(false);
    const [editRoomId, setEditRoomId] = useState(null);

    const emptyRoom = {
        name: "",
        price: "",
        gst: "",
        maxGuest: "",
        amenities: "",
        images: [], // { file, preview }
        description: "",
        isActive: true,
    };

    const [roomForm, setRoomForm] = useState(emptyRoom);

    /* ---------------- IMAGE HANDLERS ---------------- */

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setRoomForm((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
        }));

        e.target.value = "";
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(roomForm.images[index].preview);

        setRoomForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    /* ---------------- FORM HANDLERS ---------------- */

    const resetFormState = () => {
        setFormOpen(false);
        setEditRoomId(null);
        setRoomForm(emptyRoom);
        setExistingImages([]);
        setRemovedImages([]);
    };

    const handleAdd = () => {
        resetFormState();
        setFormOpen(true);
    };

    const handleEdit = (room) => {
        setEditRoomId(room.id);

        setExistingImages(room.images || []);
        setRemovedImages([]);

        setRoomForm({
            name: room.name,
            price: room.price,
            gst: room.gst,
            maxGuest: room.maxGuest,
            amenities: room.amenities.join(", "),
            description: room.description,
            images: [], // new images only
            isActive: room.isActive,
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
        if (!confirm("Delete this room?")) return;
        await deleteRoom.mutateAsync(id);
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            formData.append("name", roomForm.name);
            formData.append("price", roomForm.price);
            formData.append("gst", roomForm.gst);
            formData.append("maxGuest", roomForm.maxGuest);
            formData.append("description", roomForm.description);

            if (typeof roomForm.isActive === "boolean") {
                formData.append("isActive", roomForm.isActive.toString());
            }

            formData.append(
                "amenities",
                JSON.stringify(
                    roomForm.amenities
                        .split(",")
                        .map((a) => a.trim())
                        .filter(Boolean)
                )
            );

            // ADD MODE
            if (!editRoomId) {
                roomForm.images.forEach((img) => {
                    formData.append("images", img.file);
                });

                await createRoom.mutateAsync(formData);
            }
            // EDIT MODE
            else {
                formData.append("removedImages", JSON.stringify(removedImages));

                roomForm.images.forEach((img) => {
                    formData.append("images", img.file);
                });

                await updateRoom.mutateAsync({
                    roomId: editRoomId,
                    roomData: formData,
                });
            }

            // RESET
            resetFormState();

        } catch (error) {
            console.error("Room save failed", error);
        }
    };

    /* ---------------- UI ---------------- */

    return (
        <div className="min-h-screen pt-14 px-4 sm:px-8 bg-bgColor">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center mb-6"
            >
                <h1 className="text-2xl font-bold text-primaryLite">
                    Manage Rooms
                </h1>
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdd}
                    className="bg-buttons text-white px-5 py-2 rounded-xl"
                >
                    + Add Room
                </motion.button>
            </motion.div>

            {/* ROOM LIST */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence mode="wait">
                    {getAllRooms.isLoading ? (
                        // Skeleton loaders
                        <>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <RoomCardSkeleton key={`skeleton-${i}`} />
                            ))}
                        </>
                    ) : rooms.length === 0 ? (
                        // Empty state
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full text-center py-12"
                        >
                            <Icon icon="mdi:home-outline" width="48" height="48" className="mx-auto mb-4 text-gray-400" />
                            <p className="text-center text-gray-500">
                                No rooms available
                            </p>
                        </motion.div>
                    ) : (
                        // Room cards
                        rooms.map((room, index) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -8, boxShadow: "0 12px 24px rgba(0,0,0,0.15)" }}
                                className="bg-cards rounded-xl shadow overflow-hidden"
                            >
                                <motion.div
                                    className="overflow-hidden"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <img
                                        src={room.images?.[0]}
                                        alt={room.name}
                                        className="h-40 w-full object-cover"
                                    />
                                </motion.div>

                                <div className="p-4">
                                    <h3 className="font-semibold text-lg">{room.name}</h3>
                                    <p className="text-sm text-grayDark">
                                        ₹{room.price} + {room.gst}% GST
                                    </p>
                                    <p className="text-xs mt-1 text-grayDark">
                                        Max Guests: {room.maxGuest}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {room.amenities.map((a, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 + i * 0.05 }}
                                                className="text-xs bg-grayLite px-2 py-1 rounded-full"
                                            >
                                                {a}
                                            </motion.span>
                                        ))}
                                    </div>

                                    <div className="flex justify-end gap-3 mt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleEdit(room)}
                                        >
                                            <Icon
                                                icon="mdi:pencil"
                                                className="w-5 h-5 text-primaryLite cursor-pointer"
                                            />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDelete(room.id)}
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
                                {editRoomId ? "Edit Room" : "Add Room"}
                            </h2>

                            {[
                                ["name", "Room Name"],
                                ["price", "Price"],
                                ["gst", "GST %"],
                                ["maxGuest", "Max Guests"],
                                ["amenities", "Amenities (comma separated)"],
                            ].map(([key, label], idx) => (
                                <motion.input
                                    key={key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    placeholder={label}
                                    value={roomForm[key]}
                                    onChange={(e) =>
                                        setRoomForm({ ...roomForm, [key]: e.target.value })
                                    }
                                    className="w-full mb-3 px-4 py-2 border rounded-xl"
                                />
                            ))}

                            <motion.textarea
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                                placeholder="Description"
                                value={roomForm.description}
                                onChange={(e) =>
                                    setRoomForm({ ...roomForm, description: e.target.value })
                                }
                                className="w-full mb-3 px-4 py-2 border rounded-xl"
                            />

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
                                {roomForm.images.length > 0 && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-sm text-buttons font-medium mb-2"
                                    >
                                        {roomForm.images.length} image(s)
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            {/* IMAGE PREVIEW */}
                            <AnimatePresence>
                                {roomForm.images.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-6 gap-[1px] mb-4"
                                    >
                                        {roomForm.images.map((img, index) => (
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
                                    disabled={createRoom.isPending || updateRoom.isPending}
                                    className="px-4 py-2 bg-buttons text-white rounded-xl cursor-pointer disabled:opacity-70"
                                >
                                    {createRoom.isPending || updateRoom.isPending ? "Saving..." : "Save"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
