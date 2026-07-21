import * as React from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Navbar } from "./components/Navbar";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollToPlugin);
}
import { HeroSection } from "./components/HeroSection";
import { LandingSections } from "./components/LandingSections";
import { LoginPage } from "./components/LoginPage";
import { DashboardPage } from "./components/DashboardPage";

export default function App() {
  const [view, setView] = React.useState<"landing" | "login" | "dashboard">("landing");

  // Custom high-performance GSAP view transition controller
  const transitionTo = (targetView: "landing" | "login" | "dashboard", scrollAfter = false) => {
    const overlay = document.getElementById("transition-overlay");
    const content = document.getElementById("transition-overlay-content");
    
    if (!overlay) {
      setView(targetView);
      if (scrollAfter) window.scrollTo({ top: 0 });
      return;
    }

    gsap.killTweensOf([overlay, content]);

    const tl = gsap.timeline();

    // 1. Slide Up the overlay to cover screen, fade current view
    tl.to(overlay, {
      y: "0%",
      duration: 0.7,
      ease: "power3.inOut"
    });

    tl.to(content, {
      opacity: 1,
      scale: 1,
      duration: 0.3
    }, "-=0.2");

    // 2. Change state halfway
    tl.call(() => {
      setView(targetView);
      if (scrollAfter) {
        window.scrollTo({ top: 0 });
      }
    });

    // 3. Slide Out overlay towards top, fade in new view
    tl.to(overlay, {
      y: "-100%",
      duration: 0.7,
      ease: "power3.inOut",
      delay: 0.2
    });

    tl.to(content, {
      opacity: 0,
      scale: 1.1,
      duration: 0.3
    }, "-=0.5");

    // 4. Reset position after animation finishes
    tl.set(overlay, { y: "100%" });
  };

  // Scroll to Pipeline Section
  const handleExplorePipeline = () => {
    const el = document.getElementById("pipeline");
    if (el) {
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: el, autoKill: true },
        ease: "power3.inOut"
      });
    }
  };

  // Back to Landing and Scroll directly to Top
  const handleBackToLanding = () => {
    transitionTo("landing", true);
  };

  return (
    <div className="bg-[#050505] min-h-screen relative font-sora selection:bg-primary selection:text-primary-foreground">
      
      {/* Cinematic Slide Transition Overlay */}
      <div 
        id="transition-overlay" 
        className="fixed inset-0 bg-[#070707] z-[100] transform translate-y-full flex flex-col items-center justify-center border-t border-primary/20"
      >
        <div id="transition-overlay-content" className="text-center opacity-0 scale-95 flex flex-col items-center">
          <div className="w-16 h-16 rounded-lg border-2 border-primary/40 border-t-primary animate-spin mb-4" />
          <span className="text-xs uppercase tracking-[0.3em] font-mono text-primary animate-pulse">
            Establishing Neural Session Handshake...
          </span>
        </div>
      </div>

      {/* 1. LANDING PAGE VIEW */}
      {view === "landing" && (
        <>
          {/* Ambient background glowing shadows */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.06),rgba(0,0,0,0))] pointer-events-none z-[1]" />
          
          {/* Floating Glassmorphic Navbar */}
          <Navbar onLaunchConsoleClick={() => transitionTo("login")} />

          {/* Premium Hero with Spline Integrations */}
          <HeroSection 
            onLaunchConsoleClick={() => transitionTo("login")} 
            onExplorePipelineClick={handleExplorePipeline} 
          />

          {/* Extensive GSAP & Scroll-Triggered Storytelling Sections */}
          <LandingSections 
            onLaunchConsoleClick={() => transitionTo("login")} 
            onExplorePipelineClick={handleExplorePipeline} 
          />
        </>
      )}

      {/* 2. LOGIN PAGE VIEW */}
      {view === "login" && (
        <LoginPage 
          onBackToLanding={handleBackToLanding} 
          onLoginSuccess={() => transitionTo("dashboard")} 
        />
      )}

      {/* 3. DASHBOARD APPLICATION VIEW */}
      {view === "dashboard" && (
        <DashboardPage 
          onLogout={handleBackToLanding} 
        />
      )}

    </div>
  );
}
