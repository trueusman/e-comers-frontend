"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80",
    title: "Buy & Sell with Confidence",
    sub: "Usman Store connects buyers and sellers across Pakistan.",
  },
  {
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
    title: "Top Deals Every Day",
    sub: "New listings added daily for electronics, fashion, home and more.",
  },
  {
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=80",
    title: "Post in Minutes",
    sub: "Create a free ad and reach thousands of local buyers instantly.",
  },
  {
    img: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1600&q=80",
    title: "Shop Local Picks",
    sub: "Find trusted classifieds and delivery-friendly deals nearby.",
  },
  {
    img: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1600&q=80",
    title: "Trusted Classifieds",
    sub: "Browse verified products from real sellers with easy checkout.",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("left");

  // Auto-advance every 4s
  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % SLIDES.length, "left"), 4000);
    return () => clearInterval(t);
  }, [current]);

  const goTo = (idx: number, dir: "left" | "right") => {
    if (idx === current) return;
    setDirection(dir);
    setPrev(current);
    setCurrent(idx);
    setTimeout(() => setPrev(null), 600);
  };

  return (
    <section className="relative text-white overflow-hidden min-h-[340px] flex items-center">

      {/* ── Slides ── */}
      {SLIDES.map((slide, i) => {
        const isActive = i === current;
        const isPrev   = i === prev;

        let cls = "absolute inset-0 transition-none";
        if (isActive) {
          cls += direction === "left"
            ? " animate-slideHeroIn"
            : " animate-slideHeroInReverse";
        } else if (isPrev) {
          cls += direction === "left"
            ? " animate-slideHeroOut"
            : " animate-slideHeroOutReverse";
        } else {
          cls += " opacity-0 pointer-events-none";
        }

        return (
          <div key={i} className={cls}>
            {/* BG image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
              style={{ backgroundImage: `url('${slide.img}')` }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#0f172a]/70" />
          </div>
        );
      })}

      {/* ── Content (always on top) ── */}
      <div className="relative z-10 max-w-6xl mx-auto text-center w-full py-16 px-4">
        <h1
          key={`title-${current}`}
          className="text-3xl md:text-5xl font-black mb-3 drop-shadow-lg animate-heroText"
        >
          {SLIDES[current].title}
        </h1>
        <p
          key={`sub-${current}`}
          className="text-[#3b82f6] text-lg mb-8 drop-shadow animate-heroText"
          style={{ animationDelay: "80ms" }}
        >
          {SLIDES[current].sub}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
          <Link href="/listings" className="bg-white text-[#0f172a] font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Browse Deals
          </Link>
          <Link href="/post-ad" className="bg-[#3b82f6] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#2563eb] transition-colors">
            Post Your Ad
          </Link>
        </div>
      </div>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? "left" : "right")}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-[#3b82f6]"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>


    </section>
  );
}
