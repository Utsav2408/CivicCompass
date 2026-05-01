import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { AshokaCakraLoader } from "./AshokaCakraLoader";

export function RouteTransitionLoader() {
  const location = useLocation();
  const isFirstPaintRef = useRef(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isFirstPaintRef.current) {
      isFirstPaintRef.current = false;
      return;
    }

    setIsVisible(true);
    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <div
      key={location.pathname}
      role="status"
      aria-live="polite"
      aria-label="Loading screen"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(255, 252, 247, 0.75)",
        backdropFilter: "blur(1px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "var(--z-sos)",
        pointerEvents: "none",
        animation: "route-loader-fade 0.5s ease-out forwards",
      }}
    >
      <AshokaCakraLoader size={52} label="Loading screen" />
      <style>
        {`
          @keyframes route-loader-fade {
            0% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; visibility: hidden; }
          }
        `}
      </style>
    </div>
  );
}
