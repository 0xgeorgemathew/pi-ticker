import { useState, useEffect } from "react";

type Page = {
  component: React.ReactNode;
  key: string;
};

export const PriceSlider = ({ pages }: { pages: Page[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % pages.length);
    }, 3000); // Rotate

    return () => clearInterval(interval);
  }, [pages.length]);

  return (
    <div className="relative w-full h-screen">
      {pages.map((page, index) => (
        <div
          key={page.key}
          className={`absolute w-full h-full transition-opacity duration-500 ${
            index === currentIndex
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {page.component}
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {pages.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-gray-500"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};
