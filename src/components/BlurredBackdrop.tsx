// Blurred image laid over the whole screen on the entrance page (/collections/all).
// The products underneath are hidden by the blur; the category menu sits above
// it in the header. Grey with faint blue, red and green blurred blobs.
export function BlurredBackdrop() {
  const blob = "absolute rounded-full";
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[15] overflow-hidden pointer-events-none"
      style={{
        background: "linear-gradient(180deg, rgba(243,243,243,0.6) 0%, rgba(180,180,180,0.55) 45%, rgba(156,156,156,0.65) 100%)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
      }}
    >
      <div
        className={blob}
        style={{ left: "18%", top: "52%", width: "34vw", height: "34vw", background: "#2b2f8c", opacity: 0.75, filter: "blur(110px)" }}
      />
      <div
        className={blob}
        style={{ left: "30%", top: "30%", width: "26vw", height: "26vw", background: "#8a3a3a", opacity: 0.55, filter: "blur(100px)" }}
      />
      <div
        className={blob}
        style={{ left: "38%", top: "78%", width: "30vw", height: "30vw", background: "#3d6b4f", opacity: 0.45, filter: "blur(110px)" }}
      />
      <div
        className={blob}
        style={{ left: "-8%", top: "35%", width: "30vw", height: "30vw", background: "#5a5a5a", opacity: 0.5, filter: "blur(120px)" }}
      />
      <div
        className={blob}
        style={{ right: "-6%", top: "20%", width: "32vw", height: "32vw", background: "#6a6a6a", opacity: 0.45, filter: "blur(120px)" }}
      />
    </div>
  );
}
