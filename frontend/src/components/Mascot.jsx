import { useEffect, useRef, useState } from "react";

// mood: "idle" | "shy" (password typed) | "happy" (success) | "sad" (error)
function Mascot({ mood = "idle" }) {
  const mascotRef = useRef(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!mascotRef.current || mood === "shy") return;
      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.min(Math.hypot(dx, dy), 60);
      const angle = Math.atan2(dy, dx);

      setEyeOffset({
        x: Math.cos(angle) * (distance / 60) * 4,
        y: Math.sin(angle) * (distance / 60) * 4,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mood]);

  const renderEyes = () => {
    if (mood === "happy") {
      return (
        <>
          <path d="M 32 54 Q 41 42 50 54" stroke="#1f2937" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 66 54 Q 75 42 84 54" stroke="#1f2937" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      );
    }

    if (mood === "sad") {
      return (
        <>
          <g transform="translate(0, 2)">
            <circle cx="41" cy="53" r="10" fill="white" />
            <circle cx="41" cy="55" r="5" fill="#1f2937" />
            <circle cx="75" cy="53" r="10" fill="white" />
            <circle cx="75" cy="55" r="5" fill="#1f2937" />
          </g>
          <path d="M 31 42 L 47 47" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          <path d="M 85 42 L 69 47" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          <path d="M 75 64 Q 77 71 75 74 Q 72 71 75 64" fill="#38bdf8" />
        </>
      );
    }

    return (
      <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
        <circle cx="41" cy="53" r="11" fill="white" />
        <circle cx="41" cy="53" r="6.5" fill="#1f2937" />
        <circle cx="44" cy="50" r="2.5" fill="white" />

        <circle cx="75" cy="53" r="11" fill="white" />
        <circle cx="75" cy="53" r="6.5" fill="#1f2937" />
        <circle cx="78" cy="50" r="2.5" fill="white" />
      </g>
    );
  };

  const renderMouth = () => {
    if (mood === "happy") {
      return <path d="M 44 68 Q 58 82 72 68" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
    if (mood === "sad") {
      return <path d="M 46 73 Q 58 63 70 73" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
    return <path d="M 48 68 Q 58 73 68 68" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  };

  return (
    <div
      className={`mascot mascot-${mood}`}
      ref={mascotRef}
      style={{
        width: "110px",
        height: "95px",
        margin: "0 auto 10px auto",
        display: "block",
        position: "relative",
        zIndex: 10,
      }}
    >
      <svg viewBox="0 0 116 100" width="110" height="95" style={{ overflow: "visible", display: "block" }}>
        {/* Curved Oval Outer Ears */}
        <path d="M 16 34 Q 14 10 28 6 Q 42 10 44 34 Z" fill="#16a34a" />
        <path d="M 100 34 Q 102 10 88 6 Q 74 10 72 34 Z" fill="#16a34a" />
        
        {/* Curved Oval Inner Ears */}
        <path d="M 22 30 Q 20 14 28 11 Q 36 14 38 30 Z" fill="#dcfce7" />
        <path d="M 94 30 Q 96 14 88 11 Q 80 14 78 30 Z" fill="#dcfce7" />

        {/* Head */}
        <ellipse cx="58" cy="56" rx="46" ry="40" fill="#16a34a" />

        {/* Face Patch */}
        <ellipse cx="58" cy="62" rx="34" ry="28" fill="#f0fdf4" opacity="0.95" />

        {/* Pink Blush */}
        <ellipse cx="32" cy="65" rx="6" ry="3.5" fill="#f43f5e" opacity="0.25" />
        <ellipse cx="84" cy="65" rx="6" ry="3.5" fill="#f43f5e" opacity="0.25" />

        {/* Eyes */}
        {renderEyes()}

        {/* Nose */}
        <path d="M 54 62 L 62 62 L 58 67 Z" fill="#f87171" />

        {/* Mouth */}
        {renderMouth()}

        {/* Whiskers */}
        <line x1="8" y1="58" x2="28" y2="55" stroke="#1f2937" strokeWidth="1.5" opacity="0.4" />
        <line x1="8" y1="66" x2="28" y2="64" stroke="#1f2937" strokeWidth="1.5" opacity="0.4" />
        <line x1="108" y1="58" x2="88" y2="55" stroke="#1f2937" strokeWidth="1.5" opacity="0.4" />
        <line x1="108" y1="66" x2="88" y2="64" stroke="#1f2937" strokeWidth="1.5" opacity="0.4" />

        {/* Full Arms Covering Eyes (Shy State) */}
        <g
          style={{
            transform: mood === "shy" ? "translateY(0px)" : "translateY(55px)",
            opacity: mood === "shy" ? 1 : 0,
            transition: "transform 0.38s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.2s ease",
          }}
        >
          {/* Left Arm */}
          <path d="M 30 96 C 30 70 28 48 41 48 C 54 48 50 70 48 96 Z" fill="#16a34a" />
          <circle cx="36" cy="46" r="2.2" fill="#dcfce7" />
          <circle cx="41" cy="44" r="2.2" fill="#dcfce7" />
          <circle cx="46" cy="46" r="2.2" fill="#dcfce7" />
          <ellipse cx="41" cy="52" rx="4" ry="3" fill="#dcfce7" />

          {/* Right Arm */}
          <path d="M 86 96 C 86 70 88 48 75 48 C 62 48 66 70 68 96 Z" fill="#16a34a" />
          <circle cx="70" cy="46" r="2.2" fill="#dcfce7" />
          <circle cx="75" cy="44" r="2.2" fill="#dcfce7" />
          <circle cx="80" cy="46" r="2.2" fill="#dcfce7" />
          <ellipse cx="75" cy="52" rx="4" ry="3" fill="#dcfce7" />
        </g>
      </svg>
    </div>
  );
}

export default Mascot;