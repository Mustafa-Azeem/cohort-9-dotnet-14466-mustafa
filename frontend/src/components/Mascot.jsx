import { useEffect, useRef, useState } from "react";

// simple friendly blob mascot - eyes track the mouse, close when password field is focused
function Mascot({ passwordFocused }) {
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
        x: Math.cos(angle) * (distance / 60) * 4,
        y: Math.sin(angle) * (distance / 60) * 4,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="mascot" ref={mascotRef}>
      <svg viewBox="0 0 120 120" width="90" height="90">
        <circle cx="60" cy="60" r="50" fill="#16a34a" />
        <circle cx="60" cy="65" r="50" fill="#15803d" opacity="0.3" />

        {passwordFocused ? (
          <>
            <path d="M 32 52 Q 42 44 52 52" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 68 52 Q 78 44 88 52" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
              <circle cx="42" cy="52" r="9" fill="white" />
              <circle cx="42" cy="52" r="4" fill="#1f2937" />
            </g>
            <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
              <circle cx="78" cy="52" r="9" fill="white" />
              <circle cx="78" cy="52" r="4" fill="#1f2937" />
            </g>
          </>
        )}

        <path d="M 45 78 Q 60 88 75 78" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default Mascot;
