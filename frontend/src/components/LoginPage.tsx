import * as React from "react";
import { gsap } from "gsap";
import { Shield, Eye, EyeOff, Key, Mail, Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

interface LoginPageProps {
  onBackToLanding: () => void;
  onLoginSuccess: () => void;
}

export function LoginPage({ onBackToLanding, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const loginContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Elegant entrance transition
    if (loginContainerRef.current) {
      gsap.fromTo(
        loginContainerRef.current,
        { opacity: 0, scale: 0.96, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!email || !password) {
      setErrorMessage("Please supply both agency credentials.");
      return;
    }

    setIsSubmitting(true);

    // Simulate cryptographic validation handshake
    setTimeout(() => {
      setIsSubmitting(false);
      setIsAuthenticated(true);
      
      // Delay transition to simulate secure payload handshake
      setTimeout(() => {
        onLoginSuccess();
      }, 1200);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-foreground flex items-center justify-center relative p-6 font-sora select-none overflow-hidden">
      
      {/* Background Cyber-grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Floating back to landing */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-muted-foreground hover:text-primary transition-colors focus:outline-none"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Landing
      </button>

      {/* Login Form Wrapper */}
      <div 
        ref={loginContainerRef}
        className="w-full max-w-md bg-[#101010] border border-border rounded-xl p-8 shadow-[0_0_50px_rgba(34,197,94,0.05)] relative z-10"
      >
        
        {/* Verification Success Overlay */}
        {isAuthenticated && (
          <div className="absolute inset-0 bg-[#101010]/95 rounded-xl z-20 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">
              Credentials Verified
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs font-light leading-relaxed">
              Cryptographic session established. Navigating to the E-Rakshak Neural Console dashboard.
            </p>
            <div className="w-24 h-1 bg-border rounded-full mt-6 overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 bg-primary w-2/3 h-full animate-ping" />
            </div>
          </div>
        )}

        <div className="text-center space-y-3 mb-8">
          <div className="w-12 h-12 rounded bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-primary font-bold">
              INVESTIGATION PORTAL GATEWAY
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white uppercase mt-1">
              LOG IN TO E-RAKSHAK
            </h2>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Use your secure agency-provided credentials to access the sandbox terminal.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded mb-5 font-mono">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block">
              Official Email
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@cybercell.gov"
                className="w-full bg-[#181818] border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Security Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] uppercase font-mono text-muted-foreground hover:text-primary focus:outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#181818] border border-border rounded-lg pl-10 pr-10 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary bg-[#181818] accent-primary"
              />
              <span className="text-muted-foreground">Remember active token</span>
            </label>
            <button
              type="button"
              onClick={() => alert("Please contact your designated cyber cell district node administrator to reset credentials.")}
              className="text-muted-foreground hover:text-primary transition-colors focus:outline-none text-[11px]"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold uppercase tracking-wider py-3.5 rounded-lg text-xs hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Performing Cryptographic Check...
              </>
            ) : (
              "Establish Terminal Session"
            )}
          </button>

        </form>

        <div className="text-center text-[9px] text-muted-foreground/60 font-mono mt-8 leading-relaxed">
          WARNING: Authorized Personnel Only. All activities, uploads, and queries are trace-logged under national cybersecurity policy SEC-OPS-8110.
        </div>

      </div>
    </div>
  );
}
