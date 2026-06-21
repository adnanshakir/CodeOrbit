import { useCallback, useRef, useState } from "react";

/**
 * Custom hook for pixel-based panel resizing via mouse drag.
 *
 * @param {{ defaultSize: number, minSize: number, maxSize: number, direction: "horizontal" | "vertical" }} config
 * @returns {{ size: number, isResizing: boolean, startResize: (e: React.MouseEvent) => void }}
 */
export function useResizable({ defaultSize, minSize, maxSize, direction = "horizontal" }) {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const startResize = useCallback(
    (e) => {
      e.preventDefault();
      startPos.current = direction === "horizontal" ? e.clientX : e.clientY;
      startSize.current = size;
      setIsResizing(true);

      const onMouseMove = (moveEvent) => {
        const delta = direction === "horizontal"
          ? moveEvent.clientX - startPos.current
          : moveEvent.clientY - startPos.current;
        const newSize = Math.max(minSize, Math.min(maxSize, startSize.current + delta));
        setSize(newSize);
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
    },
    [size, minSize, maxSize, direction]
  );

  return { size, setSize, isResizing, startResize };
}

/**
 * Same as useResizable but delta is inverted (for right-side panels where
 * dragging left should INCREASE the panel width).
 */
export function useResizableRight({ defaultSize, minSize, maxSize }) {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const startResize = useCallback(
    (e) => {
      e.preventDefault();
      startPos.current = e.clientX;
      startSize.current = size;
      setIsResizing(true);

      const onMouseMove = (moveEvent) => {
        // Inverted: dragging left (negative delta) increases width
        const delta = startPos.current - moveEvent.clientX;
        const newSize = Math.max(minSize, Math.min(maxSize, startSize.current + delta));
        setSize(newSize);
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [size, minSize, maxSize]
  );

  return { size, setSize, isResizing, startResize };
}

/**
 * For terminal: dragging up increases height (inverted vertical).
 */
export function useResizableTop({ defaultSize, minSize, maxSize }) {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const startResize = useCallback(
    (e) => {
      e.preventDefault();
      startPos.current = e.clientY;
      startSize.current = size;
      setIsResizing(true);

      const onMouseMove = (moveEvent) => {
        // Dragging up (negative Y delta) increases height
        const delta = startPos.current - moveEvent.clientY;
        const newSize = Math.max(minSize, Math.min(maxSize, startSize.current + delta));
        setSize(newSize);
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    [size, minSize, maxSize]
  );

  return { size, setSize, isResizing, startResize };
}
