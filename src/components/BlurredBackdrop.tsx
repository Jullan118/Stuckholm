// Soft, out-of-focus backdrop for the shop pages (/collections/...). Grey with
// faint blue, red and green blurred blobs, like a photo that has been pushed
// out of focus. It sits behind the product grid and fills the whole screen.
export function BlurredBackdrop() {
  const blob = "absolute rounded-full";
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ background: "linear-gradient(180deg, #f3f3f3 0%, #b4b4b4 45%, #9c9c9c 100%)" }}
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
