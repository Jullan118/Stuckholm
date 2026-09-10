import * as React from "react";
import { GENDER_SCALE_MAX, GENDER_SCALE_MIN, GENDER_SCALE_NEUTRAL } from "@/lib/garments";

const STEPS = GENDER_SCALE_MAX - GENDER_SCALE_MIN + 1; // 5

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function posForValue(value: number) {
  return (value - GENDER_SCALE_MIN) / (STEPS - 1);
}

function valueForPos(pos: number) {
  return Math.round(pos * (STEPS - 1)) + GENDER_SCALE_MIN;
}

type GenderScaleSliderProps = {
  // 1–5, or `null` to rest the handle in the middle without having committed
  // a value yet (used on the Trash listing before a visitor has touched it —
  // nothing is filtered until they do).
  value: number | null;
  // Fires once, with a value 1–5, when a drag is released or the track is
  // clicked/tapped — never while merely dragging.
  onCommit: (value: number) => void;
  leftLabel: string;
  centerLabel: string;
  rightLabel: string;
  // Smaller footprint for use inside the upload/edit form.
  compact?: boolean;
  // When set, shows a small "reset" label (e.g. "All") above the left label,
  // for going back to an unfiltered view — the scale itself has no built-in
  // "show everything" step once a value has been committed. Only meaningful
  // on the Trash listing filter, not inside the upload/edit form.
  resetLabel?: string;
  onReset?: () => void;
};

export function GenderScaleSlider({
  value,
  onCommit,
  leftLabel,
  centerLabel,
  rightLabel,
  compact = false,
  resetLabel,
  onReset,
}: GenderScaleSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [dragPos, setDragPos] = React.useState<number | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const restingPos = value !== null ? posForValue(value) : 0.5;
  const pos = dragPos !== null ? dragPos : restingPos;

  function posFromClientX(clientX: number) {
    const track = trackRef.current;
    if (!track || track.getBoundingClientRect().width === 0) return restingPos;
    const rect = track.getBoundingClientRect();
    return clamp01((clientX - rect.left) / rect.width);
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setDragPos(posFromClientX(e.clientX));
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDragPos(posFromClientX(e.clientX));
  }

  function commitFromClientX(clientX: number) {
    const nextValue = valueForPos(posFromClientX(clientX));
    setDragPos(posForValue(nextValue));
    onCommit(nextValue);
    // Hold the snapped visual position for the transition, then hand control
    // back to the parent's `value` (which will match anyway).
    window.setTimeout(() => setDragPos(null), 200);
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging) return;
    setDragging(false);
    commitFromClientX(e.clientX);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const current = value ?? GENDER_SCALE_NEUTRAL;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onCommit(Math.max(GENDER_SCALE_MIN, current - 1));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onCommit(Math.min(GENDER_SCALE_MAX, current + 1));
    }
  }

  return (
    <div className={compact ? "w-full" : "relative w-full px-6 sm:px-10 pt-2 pb-10"}>
      {onReset && resetLabel && (
        <div className="mb-1">
          <button
            type="button"
            onClick={onReset}
            className={
              value === null
                ? "text-black text-sm sm:text-base underline underline-offset-4"
                : "text-black/50 hover:text-black text-sm sm:text-base transition-colors"
            }
          >
            {resetLabel}
          </button>
        </div>
      )}
      <div
        className={`flex items-center justify-between text-black mb-2 ${
          compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
        }`}
      >
        <span>{leftLabel}</span>
        <span className="text-black">{centerLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={GENDER_SCALE_MIN}
        aria-valuemax={GENDER_SCALE_MAX}
        aria-valuenow={value ?? GENDER_SCALE_NEUTRAL}
        aria-label={`${leftLabel} to ${rightLabel} scale`}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          setDragging(false);
          setDragPos(null);
        }}
        className={`relative flex items-center cursor-pointer touch-none outline-none ${
          compact ? "h-9" : "h-11"
        }`}
      >
        <div className="absolute left-0 right-0 h-px bg-black/20" />
        {Array.from({ length: STEPS }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-2 -translate-x-1/2 bg-black/20"
            style={{ left: `${(i / (STEPS - 1)) * 100}%` }}
          />
        ))}
        {/* The handle — a running stick figure standing in for the plain
            dot, per her sketch — dragged/tapped along the track above. */}
        <svg
          viewBox="0 0 100 90"
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 ${
            compact ? "w-7 h-7" : "w-9 h-9"
          }`}
          style={{
            left: `${pos * 100}%`,
            transition: dragging ? "none" : "left 200ms ease",
          }}
        >
          <circle cx="52" cy="16" r="12" fill="none" stroke="black" strokeWidth="8" />
          <path
            d="M52 29 L49 46 M49 33 L27 42 M49 33 L72 39 M49 46 L23 63 L18 68 M49 46 L74 60 L79 55"
            stroke="black"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
