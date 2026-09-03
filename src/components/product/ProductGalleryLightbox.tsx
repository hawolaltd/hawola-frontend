import React, { useCallback, useEffect, useRef, useState } from "react";
import FallbackProductImage from "@/components/product/FallbackProductImage";
import { lockBodyScroll } from "@/lib/bodyScrollLock";

type ProductGalleryLightboxProps = {
    open: boolean;
    imageCandidates: string[][];
    initialIndex?: number;
    onClose: () => void;
    /** Keep PDP thumbnail selection in sync while browsing the lightbox */
    onIndexChange?: (index: number) => void;
    altPrefix?: string;
};

const SWIPE_THRESHOLD_PX = 48;

export default function ProductGalleryLightbox({
    open,
    imageCandidates,
    initialIndex = 0,
    onClose,
    onIndexChange,
    altPrefix = "Product",
}: ProductGalleryLightboxProps) {
    const [index, setIndex] = useState(initialIndex);
    const touchStartX = useRef<number | null>(null);
    const onIndexChangeRef = useRef(onIndexChange);
    onIndexChangeRef.current = onIndexChange;

    useEffect(() => {
        if (open) {
            setIndex(initialIndex);
        }
    }, [open, initialIndex]);

    const emitIndexChange = useCallback((next: number) => {
        onIndexChangeRef.current?.(next);
    }, []);

    const showPrev = useCallback(() => {
        if (!imageCandidates.length) return;
        setIndex((prev) => {
            const next =
                (prev - 1 + imageCandidates.length) % imageCandidates.length;
            emitIndexChange(next);
            return next;
        });
    }, [emitIndexChange, imageCandidates.length]);

    const showNext = useCallback(() => {
        if (!imageCandidates.length) return;
        setIndex((prev) => {
            const next = (prev + 1) % imageCandidates.length;
            emitIndexChange(next);
            return next;
        });
    }, [emitIndexChange, imageCandidates.length]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
            if (event.key === "ArrowLeft") showPrev();
            if (event.key === "ArrowRight") showNext();
        };

        window.addEventListener("keydown", onKeyDown);
        const unlockScroll = lockBodyScroll();

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            unlockScroll();
        };
    }, [open, onClose, showPrev, showNext]);

    if (!open || !imageCandidates.length) {
        return null;
    }

    const handleTouchStart = (event: React.TouchEvent) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
    };

    const handleTouchEnd = (event: React.TouchEvent) => {
        const startX = touchStartX.current;
        if (startX == null) return;

        const endX = event.changedTouches[0]?.clientX ?? startX;
        const delta = endX - startX;
        if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
            if (delta > 0) {
                showPrev();
            } else {
                showNext();
            }
        }
        touchStartX.current = null;
    };

    const activeCandidates = imageCandidates[index] ?? [];

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Product image gallery"
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 text-3xl leading-none text-white"
                aria-label="Close image viewer"
            >
                &times;
            </button>

            {imageCandidates.length > 1 ? (
                <>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            showPrev();
                        }}
                        className="absolute left-2 z-10 px-3 py-2 text-4xl text-white md:left-8"
                        aria-label="Previous image"
                    >
                        &#8249;
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            showNext();
                        }}
                        className="absolute right-2 z-10 px-3 py-2 text-4xl text-white md:right-8"
                        aria-label="Next image"
                    >
                        &#8250;
                    </button>
                    <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-sm text-white/75">
                        {index + 1} / {imageCandidates.length}
                    </p>
                </>
            ) : null}

            <FallbackProductImage
                candidates={activeCandidates}
                alt={`${altPrefix} image ${index + 1}`}
                className="max-h-[90vh] max-w-[92vw] select-none rounded-lg object-contain shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                draggable={false}
            />
        </div>
    );
}
