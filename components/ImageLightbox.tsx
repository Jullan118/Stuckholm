import * as React from "react";

type ImageLightboxProps = {
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

// Full-screen image viewer: click a product photo to open it large over a
// dimmed backdrop, with left/right arrows (and swipe-free keyboard support)
// to browse between all photos for that product.
export function ImageLightbox({ images, index, alt, onClose, onNavigate }: ImageLightboxProps) {
  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [index, images.length, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 text-white/80 hover:text-white text-3xl leading-none w-10 h-10 flex items-center justify-center"
      >
        ×
      </button>

      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((index - 1 + images.length) % images.length);
          }}
          aria-label="Previous image"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl leading-none w-12 h-12 flex items-center justify-center"
        >
          ‹
        </button>
      )}

      <img
        src={images[index]}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[85vh] object-contain"
      />

      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((index + 1) % images.length);
          }}
          aria-label="Next image"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl leading-none w-12 h-12 flex items-center justify-center"
        >
          ›
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
