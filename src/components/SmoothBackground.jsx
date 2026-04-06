import { memo, useEffect, useState, useRef } from "react";
import MotionBackground from "./MotionBackground";

/**
 * A performance-optimized background component that cross-fades between images
 * and gradients to prevent UI jank during transitions.
 */
const SmoothBackground = memo(function SmoothBackground({
  background,
  bgType = "image",
  customBackground = "",
  motionVariant = "stars",
  className = "",
  isFullPage = false
}) {
  const [layers, setLayers] = useState({
    active: { id: "a", value: background, type: bgType, custom: customBackground, motion: motionVariant },
    fading: null
  });
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Determine the actual background value to compare
    const currentVal = background;

    if (currentVal === layers.active.value && bgType === layers.active.type && customBackground === layers.active.custom && motionVariant === layers.active.motion) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Start cross-fade
    setLayers({
      fading: layers.active,
      active: { id: Date.now().toString(), value: currentVal, type: bgType, custom: customBackground, motion: motionVariant }
    });

    timeoutRef.current = setTimeout(() => {
      setLayers(prev => ({ ...prev, fading: null }));
      timeoutRef.current = null;
    }, 600); // Duration matches CSS transition

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [background, bgType, customBackground, motionVariant, layers.active]);

  const renderLayer = (layer, isFading = false) => {
    if (!layer) return null;

    const style = {
      position: "absolute",
      inset: 0,
      transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: isFading ? 0 : 1,
      zIndex: isFading ? 1 : 2,
      pointerEvents: "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
      willChange: "opacity, transform",
    };

    if (layer.type === "motion") {
      return (
        <div key={layer.id} style={style} className="overflow-hidden">
          <MotionBackground variant={layer.motion} />
        </div>
      );
    }

    if (layer.type === "custom" && layer.custom) {
      style.backgroundImage = `url(${layer.custom})`;
    } else if (layer.type === "gradient") {
      style.background = layer.value;
    } else {
      style.backgroundImage = `url(${layer.value})`;
    }

    return <div key={layer.id} style={style} />;
  };

  return (
    <div
      className={`smooth-bg-container ${isFullPage ? "fixed" : "absolute"} inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    >
      {/* Base black to prevent white flashes */}
      <div className="absolute inset-0 bg-[#020617]" />
      
      {renderLayer(layers.fading, true)}
      {renderLayer(layers.active, false)}
    </div>
  );
});

export default SmoothBackground;
