"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import useAmenities from "../../../../hooks/useAmenities";
import AutoImageSlider from "@/components/AutoImageSlider";


// Skeleton Loader Component
const AmenitiesCardSkeleton = () => (
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

export default function Amenities({ embedded = false } = {}) {
    const { createAmenities, getAllAmenities, updateAmenities, deleteAmenities } = useAmenities();
    const [removedImages, setRemovedImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    // React Query data
    const { data: amenities = [] } = getAllAmenities;

    const [formOpen, setFormOpen] = useState(false);
    const [editAmenitiesId, setEditAmenitiesId] = useState(null);

    const emptyAmenities = {
        name: "",
        images: [], // { file, preview }
        isActive: true,
    };

    const [amenitiesForm, setAmenitiesForm] = useState(emptyAmenities);

    /* ---------------- IMAGE HANDLERS ---------------- */

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setAmenitiesForm((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
        }));

        e.target.value = "";
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(amenitiesForm.images[index].preview);

        setAmenitiesForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    /* ---------------- FORM HANDLERS ---------------- */

    const resetFormState = () => {
        setFormOpen(false);
        setEditAmenitiesId(null);
        setAmenitiesForm(emptyAmenities);
        setExistingImages([]);
        setRemovedImages([]);
    };

    const handleAdd = () => {
        resetFormState();
        setFormOpen(true);
    };

    const handleEdit = (amenities) => {
        setEditAmenitiesId(amenities.id);

        setExistingImages(amenities.images || []);
        setRemovedImages([]);

        setAmenitiesForm({
            name: amenities.name,
            images: [], // new images only
            isActive: amenities.isActive,
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
        if (!confirm("Delete this amenities?")) return;
        await deleteAmenities.mutateAsync(id);
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            formData.append("name", amenitiesForm.name);
            if (typeof amenitiesForm.isActive === "boolean") {
                formData.append("isActive", amenitiesForm.isActive.toString());
            }

            // ADD MODE
            if (!editAmenitiesId) {
                amenitiesForm.images.forEach((img) => {
                    formData.append("images", img.file);
                });

                await createAmenities.mutateAsync(formData);
            }
            // EDIT MODE
            else {
                formData.append("removedImages", JSON.stringify(removedImages));

                amenitiesForm.images.forEach((img) => {
                    formData.append("images", img.file);
                });

                await updateAmenities.mutateAsync({
                    amenitiesId: editAmenitiesId,
                    amenitiesData: formData,
                });
            }

            // RESET
            resetFormState();

        } catch (error) {
            console.error("amenities save failed", error);
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
                    <h1 className="text-2xl font-bold text-primaryLite">Manage Amenities</h1>
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
                    + Add Amenities
                </motion.button>
            </motion.div>

            {/* amenities LIST */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`flex gap-6 overflow-x-auto pb-3 scroll-smooth no-scrollbar overscroll-x-contain ${embedded ? "-mx-4 px-4 sm:-mx-6 sm:px-6" : ""}`}
            >
                <AnimatePresence mode="wait">
                    {getAllAmenities.isLoading ? (
                        // Skeleton loaders
                        <>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <AmenitiesCardSkeleton key={`skeleton-${i}`} />
                            ))}
                        </>
                    ) : amenities.length === 0 ? (
                        // Empty state
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="min-w-full py-12 text-center"
                        >
                            <Icon icon="mdi:home-outline" width="48" height="48" className="mx-auto mb-4 text-gray-400" />
                            <p className="text-center text-gray-500">
                                No Amenities available
                            </p>
                        </motion.div>
                    ) : (
                        // amenities cards
                        amenities.map((amenities, index) => (
                            <motion.div
                                key={amenities.id}
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
                                        images={amenities.images}
                                        alt={amenities.name}
                                        className="h-56 w-full object-cover"
                                    />
                                </motion.div>

                                <div className="p-4">
                                    <h3 className="font-semibold text-lg">{amenities.name}</h3>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleEdit(amenities)}
                                        >
                                            <Icon
                                                icon="mdi:pencil"
                                                className="w-5 h-5 text-primaryLite cursor-pointer"
                                            />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDelete(amenities.id)}
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
                                {editAmenitiesId ? "Edit amenities" : "Add amenities"}
                            </h2>

                            {[
                                ["name", "amenities Name"],
                            ].map(([key, label], idx) => (
                                <motion.input
                                    key={key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    placeholder={label}
                                    value={amenitiesForm[key]}
                                    onChange={(e) =>
                                        setAmenitiesForm({ ...amenitiesForm, [key]: e.target.value })
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
                                {amenitiesForm.images.length > 0 && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-sm text-buttons font-medium mb-2"
                                    >
                                        {amenitiesForm.images.length} image(s)
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            {/* IMAGE PREVIEW */}
                            <AnimatePresence>
                                {amenitiesForm.images.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-6 gap-[1px] mb-4"
                                    >
                                        {amenitiesForm.images.map((img, index) => (
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
                                    disabled={createAmenities.isPending || updateAmenities.isPending}
                                    className="px-4 py-2 bg-buttons text-white rounded-xl cursor-pointer disabled:opacity-70"
                                >
                                    {createAmenities.isPending || updateAmenities.isPending ? "Saving..." : "Save"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
