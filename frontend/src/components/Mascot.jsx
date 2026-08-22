import { useEffect, useRef, useState } from "react";

// mood: "idle" | "shy" (password being typed) | "happy" (success) | "sad" (error)
function Mascot({ mood = "idle" }) {
  const mascotRef = useRef(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.min(Math.hypot(dx, dy), 60);
      const angle = Math.atan2(dy, dx);

      setEyeOffset({
        x: Math.cos(angle) * (distance / 60) * 3,
        y: Math.sin(angle) * (distance / 60) * 3,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const renderEyes = () => {
    if (mood === "happy") {
      return (
        <>
          <path d="M 34 54 Q 41 47 48 54" stroke="#1f2937" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 68 54 Q 75 47 82 54" stroke="#1f2937" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      );
    }

    if (mood === "sad") {
      return (
        <>
          <g transform="translate(-1, 2)">
            <circle cx="41" cy="53" r="7" fill="white" />
            <circle cx="41" cy="55" r="3.5" fill="#1f2937" />
          </g>
          <g transform="translate(1, 2)">
            <circle cx="75" cy="53" r="7" fill="white" />
            <circle cx="75" cy="55" r="3.5" fill="#1f2937" />
          </g>
          {/* worried eyebrows */}
          <path d="M 33 44 L 47 48" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 83 44 L 69 48" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    }

    // idle - eyes follow the cursor
    return (
      <>
        <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
          <circle cx="41" cy="53" r="7.5" fill="white" />
          <circle cx="41" cy="53" r="3.5" fill="#1f2937" />
        </g>
        <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
          <circle cx="75" cy="53" r="7.5" fill="white" />
          <circle cx="75" cy="53" r="3.5" fill="#1f2937" />
        </g>
      </>
    );
  };

  const renderMouth = () => {
    if (mood === "happy") {
      return <path d="M 46 68 Q 58 78 70 68" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    }
    if (mood === "sad") {
      return <path d="M 46 72 Q 58 64 70 72" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    }
    return <path d="M 50 68 Q 58 72 66 68" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />;
  };

  return (
    <div className={`mascot mascot-${mood}`} ref={mascotRef}>
      <svg viewBox="0 0 116 100" width="88" height="76">
        {/* ears */}
        <path d="M 16 30 L 30 4 L 42 32 Z" fill="#16a34a" />
        <path d="M 100 30 L 86 4 L 74 32 Z" fill="#16a34a" />
        <path d="M 22 26 L 30 12 L 37 27 Z" fill="#dcfce7" />
        <path d="M 94 26 L 86 12 L 79 27 Z" fill="#dcfce7" />

        {/* head */}
        <ellipse cx="58" cy="56" rx="46" ry="40" fill="#16a34a" />

        {/* face patch */}
        <ellipse cx="58" cy="62" rx="34" ry="28" fill="#f0fdf4" opacity="0.9" />

        {mood === "shy" ? (
          <>
            {/* eyes closed happily under the paws */}
            <path d="M 34 53 Q 41 48 48 53" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 68 53 Q 75 48 82 53" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* paws covering eyes */}
            <ellipse cx="41" cy="52" rx="13" ry="11" fill="#16a34a" />
            <ellipse cx="75" cy="52" rx="13" ry="11" fill="#16a34a" />
            <ellipse cx="41" cy="58" rx="4" ry="3" fill="#dcfce7" />
            <ellipse cx="75" cy="58" rx="4" ry="3" fill="#dcfce7" />
          </>
        ) : (
          renderEyes()
        )}

        {/* nose */}
        <path d="M 54 61 L 62 61 L 58 66 Z" fill="#f87171" />

        {renderMouth()}

        {/* whiskers */}
        <line x1="8" y1="58" x2="28" y2="55" stroke="#1f2937" strokeWidth="1.5" opacity="0.5" />
        <line x1="8" y1="66" x2="28" y2="64" stroke="#1f2937" strokeWidth="1.5" opacity="0.5" />
        <line x1="108" y1="58" x2="88" y2="55" stroke="#1f2937" strokeWidth="1.5" opacity="0.5" />
        <line x1="108" y1="66" x2="88" y2="64" stroke="#1f2937" strokeWidth="1.5" opacity="0.5" />
      </svg>
    </div>
  );
}

export default Mascot;
