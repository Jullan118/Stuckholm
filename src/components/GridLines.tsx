// The header grid's lines continued straight down the page, as dividers
// between the product columns. Each line in the drawing is a pair of thin
// strokes, so each divider here is a pair too.
// Place it inside a `relative` box whose top edge is the bottom of the header
// (see Consume). Positions come from the --gl-* values in index.css.

// `gap` is the distance between the two strokes, in drawing units.
const LINES = [
  { at: "var(--gl-l2)", gap: 5.2, fromMd: true },
  { at: "var(--gl-c)", gap: 4.2, fromMd: false },
  { at: "var(--gl-r2)", gap: 5.2, fromMd: true },
];

export function GridLines() {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-10">
      {LINES.flatMap((line) =>
        [-0.5, 0.5].map((side) => (
          <div
            key={`${line.at}${side}`}
            // On phones there are two columns, so only the centre line is drawn.
            className={`grid-line-stroke ${line.fromMd ? "hidden md:block" : ""}`}
            style={{ left: `calc(50% + ${line.at} + var(--grid-ppu) * ${line.gap * side})` }}
          />
        ))
      )}
    </div>
  );
}
