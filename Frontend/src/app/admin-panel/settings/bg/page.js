"use client";

import { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import useBG from "../../../../hooks/useBG";

const createImageId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `bg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const createEmptyFormState = () => ({
    images: [],
    isActive: true,
});

// Skeleton Loader Component
const EventCardSkeleton = () => (
    <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-[280px] flex-shrink-0 overflow-hidden rounded-xl bg-cards shadow sm:w-[320px]"
    >
        <div className="h-40 w-full bg-gray-200" />
        <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 w-16 rounded-full bg-gray-200" />
                ))}
            </div>
        </div>
    </motion.div>
);

const ImageTile = ({ image, onDelete, showParentId = false }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="group relative w-[240px] flex-shrink-0 snap-center overflow-hidden rounded-xl border border-white/60 bg-black/5 shadow-sm"
    >
        <img
            src={image.src}
            alt={image.alt}
            className="h-56 w-full object-cover"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="truncate text-xs font-medium text-white">
                {image.id}
            </p>
            {showParentId && image.parentId && (
                <p className="truncate text-[11px] text-white/70">
                    BG: {image.parentId}
                </p>
            )}
        </div>

        <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onDelete(image)}
            className="absolute right-2 top-2 rounded-full bg-black/55 p-2 text-white opacity-0 transition group-hover:opacity-100"
            aria-label={`Delete ${image.id}`}
        >
            <Icon icon="mdi:delete" className="h-4 w-4" />
        </motion.button>
    </motion.div>
);

export default function BG({ embedded = false } = {}) {
    const { createBG, getAllBG, deleteBG } = useBG();

    const { data: bgData = [] } = getAllBG;
    const [formOpen, setFormOpen] = useState(false);
    const [formBG, setFormBG] = useState(createEmptyFormState);

    const savedRailRef = useRef(null);
    const draftRailRef = useRef(null);

    const imageRailClass =
        "flex gap-3 overflow-x-auto scroll-smooth no-scrollbar overscroll-x-contain snap-x snap-mandatory pb-2";

    const savedImages = useMemo(() => {
        return bgData.flatMap((bgItem) =>
            (bgItem.images || []).map((src, index) => {
                const bgImageCount = bgItem.images?.length || 0;

                return {
                    id: `${bgItem.id}-${index + 1}`,
                    src,
                    alt: `background ${index + 1}`,
                    parentId: bgItem.id,
                    bgImageCount,
                    isLastImage: bgImageCount <= 1,
                };
            })
        );
    }, [bgData]);

    /* ---------------- IMAGE HANDLERS ---------------- */

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files || []);

        const newImages = files.map((file) => ({
            id: createImageId(),
            file,
            preview: URL.createObjectURL(file),
        }));

        setFormBG((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
        }));

        e.target.value = "";
    };

    const removeDraftImage = (imageId) => {
        setFormBG((prev) => {
            const target = prev.images.find((img) => img.id === imageId);

            if (target) {
                URL.revokeObjectURL(target.preview);
            }

            return {
                ...prev,
                images: prev.images.filter((img) => img.id !== imageId),
            };
        });
    };

    const clearDraftImages = () => {
        formBG.images.forEach((img) => URL.revokeObjectURL(img.preview));
        setFormBG(createEmptyFormState());
    };

    /* ---------------- FORM HANDLERS ---------------- */

    const resetFormState = () => {
        clearDraftImages();
        setFormOpen(false);
    };

    const handleAdd = () => {
        setFormOpen(true);
    };

    const handleDeleteSavedImage = async (image) => {
        if (!confirm("Delete this image?")) return;

        try {
            if (image.isLastImage) {
                await deleteBG.mutateAsync(image.parentId);
                return;
            }

            const formData = new FormData();
            formData.append("removedImages", JSON.stringify([image.src]));

        } catch (error) {
            console.error("Image delete failed", error);
        }
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            if (typeof formBG.isActive === "boolean") {
                formData.append("isActive", formBG.isActive.toString());
            }

            formBG.images.forEach((img) => {
                formData.append("images", img.file);
            });

            await createBG.mutateAsync(formData);
            resetFormState();
        } catch (error) {
            console.error("bgData save failed", error);
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
                    <div>
                        <h1 className="text-2xl font-bold text-primaryLite">
                            Manage BG
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Upload multiple background images, browse them in one rail, and remove any image individually.
                        </p>
                    </div>
                )}

                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdd}
                    className="cursor-pointer rounded-xl bg-buttons px-5 py-2 text-white"
                >
                    + Add BG
                </motion.button>
            </motion.div>

                <motion.div
                    ref={savedRailRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={imageRailClass}
                >
                    <AnimatePresence mode="popLayout">
                        {getAllBG.isLoading ? (
                            <>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <EventCardSkeleton key={`skeleton-${i}`} />
                                ))}
                            </>
                        ) : savedImages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="min-w-full py-12 text-center"
                            >
                                <Icon
                                    icon="mdi:image-outline"
                                    width="48"
                                    height="48"
                                    className="mx-auto mb-4 text-gray-400"
                                />
                                <p className="text-gray-500">No BG available</p>
                            </motion.div>
                        ) : (
                            savedImages.map((image) => (
                                <ImageTile
                                    key={image.id}
                                    image={image}
                                    onDelete={handleDeleteSavedImage}
                                    showParentId
                                />
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
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6"
                        >
                            <h2 className="mb-2 text-lg font-semibold">
                                Add BG Images
                            </h2>

                            <motion.input
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="mb-3 w-full cursor-pointer px-4 py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-buttons file:px-4 file:py-2 file:text-white"
                            />

                            <AnimatePresence>
                                {formBG.images.length > 0 && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-3 text-sm font-medium text-buttons"
                                    >
                                        {formBG.images.length} image(s) selected
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {formBG.images.length > 0 && (
                                        <motion.div
                                            ref={draftRailRef}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={imageRailClass}
                                        >
                                            <AnimatePresence mode="popLayout">
                                                {formBG.images.map((img) => (
                                                    <ImageTile
                                                        key={img.id}
                                                        image={{
                                                            id: img.id,
                                                            src: img.preview,
                                                            alt: "Preview",
                                                        }}
                                                        onDelete={() => removeDraftImage(img.id)}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-end gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={resetFormState}
                                    className="cursor-pointer rounded-xl border px-4 py-2"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSubmit}
                                    disabled={createBG.isPending || formBG.images.length === 0}
                                    className="cursor-pointer rounded-xl bg-buttons px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {createBG.isPending ? "Saving..." : "Save"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
