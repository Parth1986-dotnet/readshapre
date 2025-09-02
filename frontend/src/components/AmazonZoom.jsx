import React, { useEffect, useMemo, useRef, useState } from "react";
import "./AmazonZoom.css";

/**
 * Amazon-style image zoom with:
 * - Left thumbnails
 * - Main image
 * - Right floating zoom pane (separate from image)
 *
 * Props:
 *  images: string[] (first is default)
 *  zoomScale: number (2.0–3.0 is typical)
 *  paneSize: { width: number, height: number }
 */
export default function AmazonZoom({
  images = [],
  zoomScale = 2.5,
  paneSize = { width: 420, height: 560 },
  className = "",
  thumbWidth = 60,
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeSrc = images[activeIdx] || "";

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const lensRef = useRef(null);
  const [isZooming, setIsZooming] = useState(false);
  const [bgSize, setBgSize] = useState({ w: 0, h: 0 });
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });

  // Compute lens size so the zoom pane shows exactly paneSize area
  // lensSize = paneSize / zoomScale (scaled by main image render size)
  const lensSize = useMemo(() => {
    const imgEl = imgRef.current;
    if (!imgEl) return { w: 120, h: 120 };
    const rect = imgEl.getBoundingClientRect();
    const lw = Math.max(60, Math.min(rect.width, paneSize.width / zoomScale));
    const lh = Math.max(60, Math.min(rect.height, paneSize.height / zoomScale));
    return { w: lw, h: lh };
  }, [zoomScale, paneSize.width, paneSize.height, activeSrc]);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (!imgEl) return;

    const updateBg = () => {
      const w = (imgEl.naturalWidth || imgEl.width) * zoomScale;
      const h = (imgEl.naturalHeight || imgEl.height) * zoomScale;
      setBgSize({ w, h });
    };

    if (imgEl.complete) {
      updateBg();
    } else {
      imgEl.addEventListener("load", updateBg, { once: true });
    }

    const onResize = () => updateBg();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeSrc, zoomScale]);

  const handleMove = (clientX, clientY) => {
    const imgEl = imgRef.current;
    const lensEl = lensRef.current;
    if (!imgEl || !lensEl) return;

    const rect = imgEl.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // clamp to image
    x = Math.max(lensSize.w / 2, Math.min(x, rect.width - lensSize.w / 2));
    y = Math.max(lensSize.h / 2, Math.min(y, rect.height - lensSize.h / 2));

    // position lens
    lensEl.style.left = `${x - lensSize.w / 2}px`;
    lensEl.style.top = `${y - lensSize.h / 2}px`;
    lensEl.style.width = `${lensSize.w}px`;
    lensEl.style.height = `${lensSize.h}px`;

    // compute background position for zoom pane
    const rx = (x / rect.width) * bgSize.w - paneSize.width / 2;
    const ry = (y / rect.height) * bgSize.h - paneSize.height / 2;
    setBgPos({
      x: -Math.max(0, Math.min(rx, bgSize.w - paneSize.width)),
      y: -Math.max(0, Math.min(ry, bgSize.h - paneSize.height)),
    });
  };

  const onMouseMove = (e) => {
    setIsZooming(true);
    handleMove(e.clientX, e.clientY);
  };
  const onMouseEnter = (e) => {
    setIsZooming(true);
    handleMove(e.clientX, e.clientY);
  };
  const onMouseLeave = () => setIsZooming(false);

  // Mobile: tap to toggle, drag to move
  const [touchZoom, setTouchZoom] = useState(false);
  const onTouchStart = (e) => {
    setTouchZoom((z) => !z);
    if (e.touches?.[0]) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const onTouchMove = (e) => {
    if (!touchZoom) return;
    if (e.touches?.[0]) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const onTouchEnd = () => {
    // keep zoom open until next tap
  };

  return (
    <div className={`az-wrap ${className}`} ref={containerRef}>
      {/* Thumbnails */}
      <div className="az-thumbs" style={{ width: thumbWidth + 16 }}>
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            className={`az-thumb ${i === activeIdx ? "active" : ""}`}
            onClick={() => setActiveIdx(i)}
            style={{ width: thumbWidth, height: thumbWidth * 1.4 }}
          >
            <img src={src} alt={`thumb-${i}`} />
          </button>
        ))}
      </div>

      {/* Main image + lens */}
      <div className="az-main">
        <div
          className="az-main-inner"
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img ref={imgRef} src={activeSrc} alt="Book cover" className="az-main-img" />
          <div ref={lensRef} className={`az-lens ${isZooming || touchZoom ? "show" : ""}`} />
        </div>
      </div>

      {/* Zoom pane (separate, Amazon-style) */}
      <div
        className={`az-zoom ${isZooming || touchZoom ? "show" : ""}`}
        style={{
          width: paneSize.width,
          height: paneSize.height,
          backgroundImage: `url('${activeSrc}')`,
          backgroundSize: `${bgSize.w}px ${bgSize.h}px`,
          backgroundPosition: `${bgPos.x}px ${bgPos.y}px`,
        }}
      />
    </div>
  );
}
