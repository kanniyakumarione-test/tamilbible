/**
 * Utility to resize and compress images on the client side using Canvas.
 * This ensures that even high-resolution user-uploaded images or pasted links
 * are optimized before being stored in the app state or localStorage.
 */

const MAX_DIMENSION = 1920; // 1080p width/height
const COMPRESSION_QUALITY = 0.82;

/**
 * Resizes an image File or Blob to a maximum dimension and compresses it as a JPEG.
 */
export async function optimizeImage(source) {
  let fileUrl;
  
  if (source instanceof File || source instanceof Blob) {
    fileUrl = URL.createObjectURL(source);
  } else if (typeof source === "string") {
    fileUrl = source;
  } else {
    throw new Error("Invalid image source for optimization.");
  }

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Try to handle CORS for links
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image for optimization."));
      img.src = fileUrl;
    });

    const canvas = document.createElement("canvas");
    const ratio = Math.min(MAX_DIMENSION / image.width, MAX_DIMENSION / image.height, 1);

    canvas.width = Math.round(image.width * ratio);
    canvas.height = Math.round(image.height * ratio);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context.");
    
    // Draw and compress
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", COMPRESSION_QUALITY);
  } finally {
    if (source instanceof File || source instanceof Blob) {
      URL.revokeObjectURL(fileUrl);
    }
  }
}

/**
 * Attempts to compress an external image URL if CORS allowed.
 * Returns the optimized data URL if successful, or the original URL as a fallback.
 */
export async function tryOptimizeExternalImage(url) {
  if (!url || typeof url !== "string") return url;
  
  // Don't optimize if it's already a data URL or a local path
  if (url.startsWith("data:") || !url.startsWith("http")) return url;

  try {
    // Attempt optimization
    return await optimizeImage(url);
  } catch (error) {
    // Fallback silently if CORS blocks the canvas draw
    console.warn("[ImageOptimization] Falling back to raw URL due to CORS or load error:", url);
    return url;
  }
}
