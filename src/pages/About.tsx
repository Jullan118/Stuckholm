export function About() {
  return (
    <div className="relative z-0 w-full min-h-screen bg-[#801332]">
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
        <div className="w-full max-w-3xl px-6 text-center">
          <a
            href="https://skrap.se"
            target="_blank"
            rel="noreferrer"
            className="block max-w-[28rem] mx-auto hover:scale-105 transition-transform"
          >
            <img
              src="/images/skrap-logo-5.jpg"
              alt="Skräp"
              className="w-full h-auto"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
