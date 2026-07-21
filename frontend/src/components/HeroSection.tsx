import * as React from "react";
import { Suspense } from "react";
import { gsap } from "gsap";

// Lazy-load the Spline component as requested
const Spline = React.lazy(() => import("@splinetool/react-spline"));

interface HeroSectionProps {
  onLaunchConsoleClick: () => void;
  onExplorePipelineClick: () => void;
}

export function HeroSection({ onLaunchConsoleClick, onExplorePipelineClick }: HeroSectionProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const ctx = gsap.context(() => {
      // Navbar slide down
      gsap.fromTo(
        "#navbar-container",
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, ease: "power3.out" }
      );

      const tl = gsap.timeline();

      // Headline characters
      tl.fromTo(
        ".hero-char-anim",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "power3.out", delay: 0.2 }
      );

      // Subheading
      tl.fromTo(
        ".hero-word-anim",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "power3.out" },
        "-=0.6"
      );

      // Paragraph description
      tl.fromTo(
        ".hero-desc-line",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );

      // Buttons
      tl.fromTo(
        ".hero-btn-container button",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
        "-=0.6"
      );

      // Trust statement
      tl.fromTo(
        ".hero-trust-line",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-end bg-hero-bg overflow-hidden"
      id="home"
    >
      {/* Spline */}
      <div className="absolute inset-0">
        <Suspense fallback={
          <div className="absolute inset-0 bg-hero-bg" />
        }>
          <Spline
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
            className="w-full h-full pointer-events-none"
          />
        </Suspense>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-20 pointer-events-none w-full md:w-[40%] px-6 md:px-12 lg:px-16 pb-12 md:pb-16 pt-32 flex flex-col justify-end">
        
        {/* Animated Headline Wrapper */}
        <div className="mb-2 md:mb-4">
          <h1 className="text-[clamp(2.75rem,7.5vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.05em] text-foreground uppercase whitespace-nowrap flex">
            {"E-RAKSHAK".split("").map((char, idx) => (
              <span key={idx} className="inline-block overflow-hidden">
                <span className="inline-block hero-char-anim" style={{ display: "inline-block" }}>
                  {char}
                </span>
              </span>
            ))}
          </h1>
        </div>

        {/* Animated Subheading Wrapper */}
        <div className="mb-3 md:mb-6">
          <p className="text-primary text-[clamp(1.125rem,2.2vw,1.75rem)] font-light leading-relaxed flex flex-wrap">
            {"AI Malware Investigation".split(" ").map((word, idx) => (
              <span key={idx} className="inline-block overflow-hidden mr-[0.3em]">
                <span className="inline-block hero-word-anim" style={{ display: "inline-block" }}>
                  {word}
                </span>
              </span>
            ))}
          </p>
        </div>

        {/* Animated Description Wrapper */}
        <div className="overflow-hidden mb-5 md:mb-8">
          <p className="text-muted-foreground text-[clamp(0.875rem,1.4vw,1.15rem)] font-light leading-relaxed hero-desc-line">
            Analyze Android APKs and Windows executables using AI-powered behavioral reasoning, automated MITRE ATT&CK mapping, dynamic sandbox analysis, and investigation-ready forensic reporting.
          </p>
        </div>

        {/* Animated Buttons - pointer-events-auto to re-enable clicks */}
        <div className="flex flex-wrap gap-4 font-bold pointer-events-auto hero-btn-container">
          <button
            onClick={onLaunchConsoleClick}
            className="bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm uppercase tracking-wider rounded-sm cursor-pointer hover:shadow-[0_0_25px_rgba(34,197,94,0.45)] hover:brightness-110 active:scale-[0.97] transition-all duration-300 font-bold"
          >
            Launch Console
          </button>
          <button
            onClick={onExplorePipelineClick}
            className="bg-white text-background px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm uppercase tracking-wider rounded-sm cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-90 active:scale-[0.97] transition-all duration-300 font-bold"
          >
            Explore Pipeline
          </button>
        </div>

        {/* Animated Trust Line */}
        <p className="text-muted-foreground/60 text-xs font-light mt-6 md:mt-8 tracking-wide hero-trust-line">
          Built for Cyber Crime Investigation. <span className="text-foreground/40 font-mono">Android • Windows • AI Agents</span>
        </p>

      </div>
    </section>
  );
}
