import { useEffect, useRef } from "react";

export default function useMagnifier(imgId) {
  const glassRef = useRef(null);

  useEffect(() => {
    const img = document.getElementById(imgId);
    if (!img) return;

    const glass = document.createElement("div");
    glass.setAttribute("class", "img-magnifier-glass");
    glassRef.current = glass;
    img.parentElement.appendChild(glass);

    const bw = 3;
    const zoom = 2;

    glass.style.backgroundImage = `url('${img.src}')`;
    glass.style.backgroundRepeat = "no-repeat";
    glass.style.backgroundSize = `${img.width * zoom}px ${img.height * zoom}px`;

    const moveMagnifier = (e) => {
      e.preventDefault();
      const pos = getCursorPos(e);
      let x = pos.x;
      let y = pos.y;

      if (x > img.width - glass.offsetWidth / zoom) {
        x = img.width - glass.offsetWidth / zoom;
      }
      if (x < glass.offsetWidth / zoom) {
        x = glass.offsetWidth / zoom;
      }
      if (y > img.height - glass.offsetHeight / zoom) {
        y = img.height - glass.offsetHeight / zoom;
      }
      if (y < glass.offsetHeight / zoom) {
        y = glass.offsetHeight / zoom;
      }

      glass.style.left = x - glass.offsetWidth / 2 + "px";
      glass.style.top = y - glass.offsetHeight / 2 + "px";
      glass.style.backgroundPosition = `-${(x * zoom) - glass.offsetWidth / 2}px -${(y * zoom) - glass.offsetHeight / 2}px`;
    };

    const getCursorPos = (e) => {
      const a = img.getBoundingClientRect();
      let x = e.pageX - a.left - window.pageXOffset;
      let y = e.pageY - a.top - window.pageYOffset;
      return { x, y };
    };

    img.addEventListener("mousemove", moveMagnifier);
    glass.addEventListener("mousemove", moveMagnifier);

    return () => {
      img.removeEventListener("mousemove", moveMagnifier);
      glass.removeEventListener("mousemove", moveMagnifier);
      glass.remove();
    };
  }, [imgId]);

  return null;
}
