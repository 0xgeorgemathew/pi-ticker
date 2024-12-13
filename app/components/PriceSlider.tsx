import {
  useState,
  useEffect,
  useCallback,
  TouchEvent,
  MouseEvent,
} from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Page = {
  component: React.ReactNode;
  key: string;
};

export const PriceSlider = ({
  pages,
  className,
}: {
  pages: Page[];
  className?: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [startPosition, setStartPosition] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % pages.length);
  }, [pages.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? pages.length - 1 : prevIndex - 1
    );
  }, [pages.length]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(handleNext, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, handleNext]);

  const handleTouchStart = (e: TouchEvent) => {
    setIsPlaying(false);
    setIsDragging(true);
    setStartPosition(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    setCurrentPosition(e.touches[0].clientX);
    const newOffset = startPosition - e.touches[0].clientX;
    setDragOffset(newOffset);
  };

  const handleMouseDown = (e: MouseEvent) => {
    setIsPlaying(false);
    setIsDragging(true);
    setStartPosition(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = useCallback(
    (e: globalThis.MouseEvent) => {
      if (!isDragging) return;
      setCurrentPosition(e.clientX);
      const newOffset = startPosition - e.clientX;
      setDragOffset(newOffset);
    },
    [isDragging, startPosition]
  );
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (!startPosition || !currentPosition) {
      setDragOffset(0);
      return;
    }

    const distance = startPosition - currentPosition;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) {
      setDragOffset(0);
      return;
    }

    if (distance > 0) {
      handleNext();
    } else {
      handlePrevious();
    }

    setStartPosition(0);
    setCurrentPosition(0);
    setDragOffset(0);
  }, [isDragging, startPosition, currentPosition, handleNext, handlePrevious]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) =>
      handleMouseMove(e);
    const handleGlobalMouseUp = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("mousemove", handleGlobalMouseMove);
    }

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging, handleMouseMove, handleDragEnd]);
  return (
    <div
      className={cn(
        "fixed inset-0 select-none overflow-hidden cursor-grab active:cursor-grabbing touch-none",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
    >
      <div
        className="relative w-full h-full flex transition-transform duration-300 ease-out"
        style={{
          transform: isDragging ? `translateX(${-dragOffset}px)` : "none",
        }}
      >
        {pages.map((page, index) => (
          <div
            key={page.key}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-500",
              index === currentIndex
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
          >
            {page.component}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center z-50">
        <div className="flex items-center gap-2 rounded-lg bg-zinc-900/90 backdrop-blur-sm p-1.5 ring-1 ring-white/10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md hover:bg-white/10"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white" />
            )}
          </Button>

          <div className="flex gap-1.5 px-2">
            {pages.map((_, index) => (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "h-2 w-2 rounded-full p-0 transition-colors",
                  index === currentIndex
                    ? "bg-white hover:bg-white/90"
                    : "bg-white/25 hover:bg-white/35"
                )}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPlaying(false);
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
