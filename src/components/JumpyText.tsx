import * as React from "react";

interface JumpyTextProps {
  text: string;
  className?: string;
}

// Splits text into one <span> per letter so each one can jump on hover,
// with a small stagger between letters (driven by the parent's `group` hover).
export function JumpyText({ text, className = "" }: JumpyTextProps) {
  return (
    <span className={`inline-flex ${className}`}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block group-hover:animate-letter-jump"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}
