import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Button } from "./ui/button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

interface NavbarProps {
  onLaunchConsoleClick: () => void;
}

export function Navbar({ onLaunchConsoleClick }: NavbarProps) {
  const [activeLink, setActiveLink] = React.useState("Home");
  const [isScrolled, setIsScrolled] = React.useState(false);
  const linkRefs = React.useRef<{ [key: string]: HTMLAnchorElement | null }>({});
  const underlineRef = React.useRef<HTMLSpanElement>(null);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Pipeline", href: "#pipeline" },
    { name: "Features", href: "#features" },
    { name: "Technology", href: "#technology" },
    { name: "Architecture", href: "#architecture" },
    { name: "About", href: "#about" },
  ];

  React.useEffect(() => {
    // 1. Shrink and blur navbar on scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    // 2. Map sections to active links using GSAP ScrollTrigger
    const sections = ["home", "pipeline", "features", "technology", "architecture", "about"];
    const activeTriggers: any[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: "top 40%",
          end: "bottom 40%",
          onToggle: (self) => {
            if (self.isActive) {
              const displayName = id.charAt(0).toUpperCase() + id.slice(1);
              setActiveLink(displayName);
            }
          }
        });
        activeTriggers.push(trigger);
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      activeTriggers.forEach((t) => t.kill());
    };
  }, []);

  // 3. Smooth sliding underline transition
  React.useEffect(() => {
    const activeEl = linkRefs.current[activeLink];
    const underline = underlineRef.current;
    if (activeEl && underline) {
      const container = document.getElementById("navbar-links");
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        const left = activeRect.left - containerRect.left;
        const width = activeRect.width;

        gsap.to(underline, {
          x: left,
          width: width,
          duration: 0.45,
          ease: "power3.out",
        });
      }
    }
  }, [activeLink]);

  // Intercept nav clicks to use smooth GSAP ScrollTo
  const handleLinkClick = (e: React.MouseEvent, href: string, name: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: target, autoKill: true },
        ease: "power3.inOut"
      });
      setActiveLink(name);
    }
  };

  return (
    <nav
      id="navbar-container"
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 lg:px-16 select-none border-b transition-all duration-500 ${
        isScrolled 
          ? "py-3 bg-background/85 backdrop-blur-md border-border/80 shadow-[0_4px_30px_rgba(0,0,0,0.4)]" 
          : "py-5 bg-transparent backdrop-blur-xs border-white/0"
      }`}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2" id="navbar-logo">
        <span className="text-foreground text-xl font-bold tracking-wider uppercase font-sora">
          E-RAKSHAK<span className="text-primary font-light">.</span>
        </span>
      </div>

      {/* Center: Nav Links */}
      <div className="hidden md:flex items-center gap-8 relative" id="navbar-links">
        {navLinks.map((link) => (
          <a
            key={link.name}
            ref={(el) => (linkRefs.current[link.name] = el)}
            href={link.href}
            onClick={(e) => handleLinkClick(e, link.href, link.name)}
            className={`text-xs uppercase tracking-widest font-semibold nav-link relative py-2 transition-colors duration-300 ${
              activeLink === link.name ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {link.name}
          </a>
        ))}
        {/* Dynamic Sliding Underline */}
        <span
          ref={underlineRef}
          className="absolute bottom-0 left-0 h-[2px] bg-primary rounded-full pointer-events-none"
          style={{ width: 0 }}
        />
      </div>

      {/* Right: CTA Button */}
      <div id="navbar-cta">
        <Button
          variant="navCta"
          size="lg"
          onClick={onLaunchConsoleClick}
          className="hidden md:inline-flex rounded-lg uppercase text-xs tracking-widest px-6"
        >
          Launch Console
        </Button>
        {/* Simple mobile menu trigger or bullet info */}
        <button
          onClick={onLaunchConsoleClick}
          className="md:hidden flex items-center justify-center p-2 rounded-lg bg-nav-button/50 border border-border text-xs text-foreground uppercase tracking-widest font-semibold px-4 active:scale-95 transition-all"
        >
          Console
        </button>
      </div>
    </nav>
  );
}
