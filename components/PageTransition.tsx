"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [stage, setStage] = useState<"idle" | "exit" | "enter">("idle");
  const prevPathname = useRef(pathname);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname === prevPathname.current) return;

    // Step 1: slide out current page (left)
    setStage("exit");

    const exitTimer = setTimeout(() => {
      // Step 2: swap content + slide in new page (right)
      setDisplayChildren(children);
      prevPathname.current = pathname;
      setStage("enter");

      const enterTimer = setTimeout(() => {
        setStage("idle");
      }, 350);

      return () => clearTimeout(enterTimer);
    }, 280);

    return () => clearTimeout(exitTimer);
  }, [pathname, children]);

  const getStyle = () => {
    if (stage === "exit")  return { animation: "pageSlideOutLeft 0.28s cubic-bezier(0.4,0,1,1) both" };
    if (stage === "enter") return { animation: "pageSlideInRight 0.35s cubic-bezier(0,0,0.2,1) both" };
    return {};
  };

  return (
    <div ref={containerRef} style={getStyle()} className="w-full">
      {displayChildren}
    </div>
  );
}
