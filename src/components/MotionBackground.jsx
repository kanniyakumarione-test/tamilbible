import { memo } from "react";

const MotionBackground = memo(function MotionBackground({ variant = "stars", className = "" }) {
  return (
    <div
      className={`motion-bg motion-bg--${variant} hidden md:block ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="motion-bg__layer motion-bg__layer--base" />
      <div className="motion-bg__layer motion-bg__layer--one" />
      <div className="motion-bg__layer motion-bg__layer--two" />
      <div className="motion-bg__layer motion-bg__layer--three" />
      <div className="motion-bg__layer motion-bg__layer--four" />
    </div>
  );
});

export default MotionBackground;
