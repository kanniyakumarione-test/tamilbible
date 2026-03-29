import React, { useState, useRef } from "react";

export default function Tooltip({ children, content }) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef();

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 200);
  };
  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <span className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <span className="absolute left-1/2 z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-3 py-1 text-xs text-white shadow-lg">
          {content}
        </span>
      )}
    </span>
  );
}
