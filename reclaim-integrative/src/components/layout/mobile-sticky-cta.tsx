"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function MobileStickyCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA only after scrolling down a bit (e.g., 300px)
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-canvas/90 backdrop-blur-md border-t border-border p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] transition-all duration-300">
      <Button variant="primary" className="w-full text-base py-6 h-auto shadow-sm">
        Book an Appointment
      </Button>
    </div>
  );
}
