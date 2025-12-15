"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

type ToneGridProps = {
  onClick?: () => void;
};

const ToneGrid = ({ onClick }: ToneGridProps) => {
  const [puckPosition, setPuckPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Calculate grid size based on container (aspect-square with padding)
  // The container has p-2 padding, so we need to account for that
  const GRID_SIZE = 254; // Approximate size of the draggable area
  const PUCK_SIZE = 20; // w-5 h-5 = 20px
  const MAX_DISTANCE = GRID_SIZE / 2 - PUCK_SIZE / 2;

  const updateTargetPosition = useCallback(
    (x: number, y: number) => {
      // Clamp values to stay within bounds
      const clampedX = Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, x));
      const clampedY = Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, y));
      setTargetPosition({ x: clampedX, y: clampedY });
    },
    [MAX_DISTANCE]
  );

  // Spring animation effect
  useEffect(() => {
    const spring = () => {
      // Spring physics: smooth interpolation with elasticity
      const springStrength = 0.15; // Lower = more elastic (slower)
      const damping = 0.8; // Damping factor

      setPuckPosition((current) => {
        const dx = targetPosition.x - current.x;
        const dy = targetPosition.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If very close, snap to target (prevents jitter)
        if (distance < 0.5) {
          return targetPosition;
        }

        // Apply spring physics
        const newX = current.x + dx * springStrength;
        const newY = current.y + dy * springStrength;

        return { x: newX, y: newY };
      });

      animationFrameRef.current = requestAnimationFrame(spring);
    };

    animationFrameRef.current = requestAnimationFrame(spring);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetPosition]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      setIsDragging(true);
      e.preventDefault();

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const handleMouseMove = (e: MouseEvent) => {
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        updateTargetPosition(x, y);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      // Initial position
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      updateTargetPosition(x, y);
      // When dragging, snap immediately for better control
      setPuckPosition({ x, y });

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [updateTargetPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || isDragging) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      updateTargetPosition(x, y);
    },
    [updateTargetPosition, isDragging]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setTargetPosition({ x: 0, y: 0 });
    }
  }, [isDragging]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!containerRef.current) return;
      setIsDragging(true);

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 0) return;
        const touch = e.touches[0];
        const x = touch.clientX - centerX;
        const y = touch.clientY - centerY;
        updateTargetPosition(x, y);
      };

      const handleTouchEnd = () => {
        setIsDragging(false);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      // Initial position
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const x = touch.clientX - centerX;
        const y = touch.clientY - centerY;
        updateTargetPosition(x, y);
        // When dragging, snap immediately for better control
        setPuckPosition({ x, y });
      }

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    },
    [updateTargetPosition]
  );

  return (
    <div
      ref={containerRef}
      className="w-full aspect-square border border-white/10 rounded-lg p-2 relative select-none overflow-hidden cursor-pointer"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%), linear-gradient(90deg, rgba(222, 217, 213, 0.1) 0%, rgba(222, 217, 213, 0.1) 100%)",
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundSize: "auto, auto",
        backgroundPosition: "center, center",
        touchAction: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onClick={onClick}
    >
      {/* Background Pattern Image Layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/pattern.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "85%",
          backgroundPosition: "center",
          opacity: 0.4,
        }}
      />
      {/* Labels */}
      <div className="absolute inset-0 pointer-events-none">
        <p className="absolute top-2 left-1/2 -translate-x-1/2 text-[9.75px] font-medium text-[#929292]">
          Positive
        </p>
        <p
          className="absolute left-2 top-1/2 -translate-y-1/2 text-[9.75px] font-medium text-[#929292]"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          Concise
        </p>
        <p
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[9.75px] font-medium text-[#929292]"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          Expanded
        </p>
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9.75px] font-medium text-[#929292]">
          Negative
        </p>
      </div>
      {/* Grid Lines */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
      </div>
      {/* Draggable Puck */}
      <div
        className={cn(
          "absolute w-5 h-5 bg-[#ac7f5e] border-2 border-white/20 rounded-full shadow-lg cursor-grab active:cursor-grabbing",
          isDragging && "scale-110"
        )}
        style={{
          left: `calc(50% + ${puckPosition.x}px - 10px)`,
          top: `calc(50% + ${puckPosition.y}px - 10px)`,
          transition: isDragging ? "none" : "transform 0.1s ease-out",
        }}
      />
    </div>
  );
};

export default ToneGrid;
