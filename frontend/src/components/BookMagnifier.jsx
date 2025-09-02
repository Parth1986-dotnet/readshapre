import React, { useEffect, useRef } from "react";
import "./BookMagnifier.css";

/**
 * Usage:
 * <BookMagnifier src={imgUrl} alt="Cover" zoom={2} lensSize={160} />
 * or
 * <BookMagnifier imageUrl={imgUrl} />
 */
export default function BookMagnifier({
  src,
  imageUrl,
  alt = "",
  zoom = 2,
  lensSize = 160,
  className = "",
}) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const lensRef = useRef(null);

  const resolvedSrc = src || imageUrl;

  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !resolvedSrc) return;

    // Create lens once
    const lens = document.createElement("div");
    lens.className = "rs-magnifier-lens";
    lens.style.width = `${lensSize}px`;
    lens.style.height = `${lensSize}px`;
    container.appendChild(lens);
    lensRef.current = lens;

    // Prep background for zoomed image (use natural size for crisp zoom)
    const setBackground = () => {
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      lens.style.backgroundImage = `url('${resolvedSrc}')`;
      lens.style.backgroundRepeat = "no-repeat";
      lens.style.backgroundSize = `${iw * zoom}px ${ih * zoom}px`;
    };

    const show = () => lens.classList.add("rs-show");
    const hide = () => lens.classList.remove("rs-show");

    const move = (clientX, clientY) => {
      const rect = img.getBoundingClientRect();
      const half = lensSize / 2;

      let x = clientX - rect.left;
      let y = clientY - rect.top;

      // clamp inside image
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x > rect.width) x = rect.width;
      if (y > rect.height) y = rect.height;

      // position the lens
      const lx = Math.max(0, Math.min(x - half, rect.width - lensSize));
      const ly = Math.max(0, Math.min(y - half, rect.height - lensSize));
      lens.style.left = `${lx}px`;
      lens.style.top = `${ly}px`;

      // background alignment
      const bgX = -((x) * zoom - half);
      const bgY = -((y) * zoom - half);
      lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
    };

    const onMouseMove = (e) => {
      show();
      move(e.clientX, e.clientY);
    };
    const onTouchMove = (e) => {
      if (!e.touches || !e.touches[0]) return;
      show();
      move(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onEnter = show;
    const onLeave = hide;

    // init after image loads (handles late loads)
    if (img.complete) setBackground();
    img.addEventListener("load", setBackground);

    // events on the image (lens has pointer-events: none)
    img.addEventListener("mousemove", onMouseMove);
    img.addEventListener("mouseenter", onEnter);
    img.addEventListener("mouseleave", onLeave);
    img.addEventListener("touchmove", onTouchMove, { passive: true });
    img.addEventListener("touchstart", onEnter, { passive: true });
    img.addEventListener("touchend", onLeave);

    // responsive
    window.addEventListener("resize", setBackground);

    return () => {
      window.removeEventListener("resize", setBackground);
      img.removeEventListener("load", setBackground);
      img.removeEventListener("mousemove", onMouseMove);
      img.removeEventListener("mouseenter", onEnter);
      img.removeEventListener("mouseleave", onLeave);
      img.removeEventListener("touchmove", onTouchMove);
      img.removeEventListener("touchstart", onEnter);
      img.removeEventListener("touchend", onLeave);
      if (lens && lens.parentNode) lens.parentNode.removeChild(lens);
    };
  }, [resolvedSrc, zoom, lensSize]);

  return (
    <div className={`rs-magnifier-container ${className}`} ref={containerRef}>
      <img
        ref={imgRef}
        src={resolvedSrc}
        alt={alt}
        className="img-fluid rounded w-100"
        draggable="false"
      />
    </div>
  );
}
