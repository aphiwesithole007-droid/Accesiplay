import { useState, useCallback, useEffect, useRef } from "react";
import { getRecommendations, type Category, type Recommendation } from "@/data/recommendations";

const CATEGORY_CONFIG = {
  movies:  { label: "MOVIES",  icon: "◈", cssVar: "--neon-cyan",   glowColor: "rgba(0,255,255,0.15)",   borderStyle: "1px solid var(--neon-cyan)"  },
  music:   { label: "MUSIC",   icon: "◉", cssVar: "--neon-pink",   glowColor: "rgba(255,0,255,0.15)",   borderStyle: "1px solid var(--neon-pink)"  },
  hobbies: { label: "HOBBIES", icon: "◆", cssVar: "--neon-yellow", glowColor: "rgba(255,255,0,0.15)", borderStyle: "1px solid var(--neon-yellow)" },
} as const;

const MARQUEE_TEXT = "BREAK THE ALGORITHM ◈ ESCAPE THE MAINSTREAM ◉ DISCOVER THE UNKNOWN ◆ SMASH YOUR COMFORT ZONE ◈ FIND WHAT THE FEED HIDES ◉ RESIST RECOMMENDATION ENGINES ◆ ";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") return initial;
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch { return initial; }
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {}
        return resolved;
      });
    },
    [key]
  );

  return [value, set] as const;
}

function GlitchTitle() {
  return (
    <div className="text-center pt-8 pb-2 px-4">
      <div className="inline-block relative">
        <h1
          className="glitch-text flicker text-3xl sm:text-5xl md:text-6xl font-black uppercase"
          data-text="COMFORT ZONE BREAKER"
          style={{ color: "var(--neon-pink)", letterSpacing: "0.06em" }}
        >
          COMFORT ZONE BREAKER
        </h1>
      </div>
      <p className="mt-3 text-xs sm:text-sm tracking-[0.3em] uppercase" style={{ color: "var(--neon-cyan)", opacity: 0.7 }}>
        // ANTI-ALGORITHM RECOMMENDATION ENGINE v2.0 //
      </p>
    </div>
  );
}

function Marquee() {
  return (
    <div className="marquee-wrap py-1 my-4" style={{ boxShadow: "0 0 10px rgba(255,0,255,0.3)" }}>
      <span className="marquee-inner text-[10px] tracking-widest uppercase" style={{ color: "var(--neon-pink)", opacity: 0.6 }}>
        {MARQUEE_TEXT}{MARQUEE_TEXT}
      </span>
    </div>
  );
}

function CategorySelector({ selected, onSelect }: { selected: Category | null; onSelect: (c: Category) => void }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center my-6">
      {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => {
        const cfg = CATEGORY_CONFIG[cat];
        const isActive = selected === cat;
        return (
          <button
            key={cat}
            className={`btn-category ${cat} ${isActive ? "active" : ""} px-6 py-3 text-sm sm:text-base`}
            onClick={() => onSelect(cat)}
          >
            <span className="mr-2">{cfg.icon}</span>
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

function LoadingBars() {
  return (
    <div className="my-8 space-y-3 px-4 max-w-md mx-auto">
      {[
        { label: "SCANNING MAINSTREAM FEEDS", color: "var(--neon-cyan)", delay: "0s" },
        { label: "LOCATING OPPOSITE COORDINATES", color: "var(--neon-pink)", delay: "0.3s" },
        { label: "COMPILING ANTI-RECOMMENDATIONS", color: "var(--neon-yellow)", delay: "0.6s" },
      ].map(({ label, color, delay }) => (
        <div key={label}>
          <div className="flex items-center gap-2 text-[10px] tracking-widest mb-1" style={{ color, opacity: 0.7 }}>
            <span>{label}</span>
            {delay === "0s" && <span className="cursor-blink" />}
          </div>
          <div className="loading-bar" style={{ animationDelay: delay }} />
        </div>
      ))}
    </div>
  );
}

function RecCard({
  rec, category, isFav, onToggleFav,
}: {
  rec: Recommendation; category: Category; isFav: boolean; onToggleFav: () => void;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const cfg = CATEGORY_CONFIG[category];
  const accentColor = `var(${cfg.cssVar})`;

  return (
    <div className="rec-card clip-corner-tr p-4 sm:p-6 mb-4" style={{ border: cfg.borderStyle, color: accentColor }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-3xl flex-shrink-0 mt-1">{rec.image}</span>
          <div className="min-w-0">
            <h3 className="font-black uppercase text-lg sm:text-xl tracking-wide leading-tight" style={{ color: accentColor }}>
              {rec.title}
            </h3>
            <p className="text-xs mt-1 tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
              {rec.subtitle}
            </p>
          </div>
        </div>
        <button
          className={`fav-btn flex-shrink-0 ${isFav ? "active" : ""}`}
          onClick={onToggleFav}
          title={isFav ? "Remove favorite" : "Save favorite"}
        >
          {isFav ? "★" : "☆"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {rec.tags.map((tag) => (
          <span key={tag} className="text-[10px] tracking-widest uppercase px-2 py-0.5"
            style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.03)" }}>
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          className="text-xs tracking-widest uppercase flex items-center gap-2 transition-all"
          style={{ color: "var(--neon-green, #0f0)", opacity: showWhy ? 1 : 0.7, textShadow: showWhy ? "0 0 8px var(--neon-green, #0f0)" : "none" }}
          onClick={() => setShowWhy(!showWhy)}
        >
          <span style={{ fontSize: "0.6rem" }}>{showWhy ? "▼" : "▶"}</span>
          WHY THIS IS DIFFERENT
        </button>
        {rec.year && (
          <span className="text-[10px] tracking-widest ml-auto" style={{ color: "rgba(255,255,255,0.25)" }}>
            {rec.year}{rec.rating ? ` · ${rec.rating}` : ""}
          </span>
        )}
      </div>

      {showWhy && (
        <div className="why-panel mt-3 pl-4 pr-2 py-3">
          <div className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: "rgba(0,255,65,0.5)" }}>
            // MAINSTREAM CONTEXT: {rec.trending}
          </div>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            {rec.why}
          </p>
        </div>
      )}
    </div>
  );
}

type FavDetail = { title: string; category: Category };

function FavoritesPanel({ favDetails, onClear }: { favDetails: Record<string, FavDetail>; onClear: () => void }) {
  const items = Object.entries(favDetails);
  if (items.length === 0) return null;

  return (
    <div className="mt-10 border-t pt-6" style={{ borderColor: "rgba(255,255,0,0.15)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold tracking-[0.3em] uppercase" style={{ color: "var(--neon-yellow)" }}>
          ★ SAVED FAVORITES ({items.length})
        </h2>
        <button className="text-[10px] tracking-widest uppercase hover:opacity-100 transition-opacity"
          style={{ color: "rgba(255,0,64,0.6)" }} onClick={onClear}>
          CLEAR ALL
        </button>
      </div>
      <div className="space-y-2">
        {items.map(([id, d]) => {
          const cfg = CATEGORY_CONFIG[d.category];
          return (
            <div key={id} className="flex items-center gap-3">
              <span className="text-[10px] tracking-widest" style={{ color: `var(${cfg.cssVar})`, opacity: 0.5 }}>
                [{d.category.toUpperCase()}]
              </span>
              <span className="text-xs font-bold tracking-wide" style={{ color: "rgba(255,255,255,0.7)" }}>
                {d.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// NEW: MASSIVE VOICE-CONTROLLED TRIAL CHECKOUT (NEON AESTHETIC)
// ----------------------------------------------------------------------
function TrialCheckout({ onTrialSuccess }: { onTrialSuccess: () => void }) {
  const [isListening, setIsListening] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Click to enable Voice Control");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardRef = useRef<HTMLInputElement>(null);
  const expRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);

  const validateAndSubmit = useCallback(() => {
    let valid = true;
    let newErrors: Record<string, string> = {};

    const card = cardRef.current?.value.replace(/\s/g, "") || "";
    if (card.length < 15) {
      newErrors.card = "INVALID CARD NUMBER";
      valid = false;
    }

    const exp = expRef.current?.value || "";
    if (!exp.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
      newErrors.exp = "INVALID MM/YY";
      valid = false;
    }

    const cvv = cvvRef.current?.value || "";
    if (cvv.length < 3) {
      newErrors.cvv = "INVALID CVV";
      valid = false;
    }

    if (valid) {
      setErrors({});
      setSuccess(true);
      setTimeout(() => {
        onTrialSuccess();
      }, 3000); // Wait 3s to show success before unlocking app
    } else {
      setErrors(newErrors);
      setStatusMsg("ERRORS DETECTED.");
      if (newErrors.card) cardRef.current?.focus();
      else if (newErrors.exp) expRef.current?.focus();
      else if (newErrors.cvv) cvvRef.current?.focus();
    }
  }, [onTrialSuccess]);

  useEffect(() => {
    if (typeof window === "undefined" || success) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMsg("VOICE CONTROL NOT SUPPORTED IN THIS BROWSER");
      return;
    }

    const recognition = new SpeechRecognition();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).recognitionInstance = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim().toLowerCase();
      if (transcript.includes("submit") || transcript.includes("start trial") || transcript.includes("pay")) {
        validateAndSubmit();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        setStatusMsg("MICROPHONE BLOCKED");
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (!success) {
        try { recognition.start(); } catch (e) {}
      }
    };

    if (isListening) {
      try {
        recognition.start();
        setStatusMsg("LISTENING... SAY 'SUBMIT' TO START TRIAL");
      } catch (e) {}
    } else {
      try { recognition.stop(); } catch (e) {}
    }

    return () => {
      try { recognition.stop(); } catch (e) {}
    };
  }, [isListening, success, validateAndSubmit]);

  const inputStyle = {
    background: "rgba(0,255,255,0.05)",
    border: "2px solid var(--neon-cyan)",
    color: "var(--neon-cyan)",
    fontSize: "2rem",
    padding: "20px",
    width: "100%",
    borderRadius: "12px",
    outline: "none",
    fontFamily: "monospace",
    textShadow: "0 0 8px var(--neon-cyan)",
    boxShadow: "inset 0 0 10px rgba(0,255,255,0.2)"
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
        <h1 className="text-5xl font-black mb-4" style={{ color: "var(--neon-green, #0f0)", textShadow: "0 0 20px #0f0" }}>
          // TRIAL ACTIVATED //
        </h1>
        <p className="tracking-[0.4em] text-lg opacity-70">SYSTEM UNLOCKED. REDIRECTING...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase mb-4" style={{ color: "var(--neon-pink)", textShadow: "0 0 15px var(--neon-pink)" }}>
          FREE TRIAL REQUIRED
        </h1>
        <p className="tracking-[0.2em] text-sm md:text-base opacity-80" style={{ color: "var(--neon-cyan)" }}>
          YOU HAVE REACHED YOUR 10 SEARCH LIMIT. ENTER CARD TO BEGIN 7-DAY UNRESTRICTED ACCESS.
        </p>
      </div>

      <button 
        onClick={() => setIsListening(true)}
        className="w-full mb-10 py-6 border-4 text-2xl font-black tracking-[0.3em] uppercase transition-all duration-300"
        style={{ 
          borderColor: isListening ? "var(--neon-green, #0f0)" : "var(--neon-pink)", 
          color: isListening ? "var(--neon-green, #0f0)" : "var(--neon-pink)",
          background: isListening ? "rgba(0,255,0,0.1)" : "transparent",
          boxShadow: isListening ? "0 0 30px rgba(0,255,0,0.3)" : "none"
        }}
      >
        {isListening ? "◉ " + statusMsg : "◈ " + statusMsg}
      </button>

      <form onSubmit={(e) => { e.preventDefault(); validateAndSubmit(); }} className="space-y-8" noValidate>
        <div>
          <label className="block text-xl tracking-[0.2em] mb-3" style={{ color: "var(--neon-cyan)" }}>CARD NUMBER</label>
          <input 
            ref={cardRef} 
            type="text" 
            placeholder="0000 0000 0000 0000" 
            style={{ ...inputStyle, borderColor: errors.card ? "var(--neon-pink)" : inputStyle.border }} 
            className="focus-visible:ring-4 focus-visible:ring-[var(--neon-yellow)]"
          />
          {errors.card && <p className="mt-2 text-xl font-bold" style={{ color: "var(--neon-pink)" }}>{errors.card}</p>}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <label className="block text-xl tracking-[0.2em] mb-3" style={{ color: "var(--neon-cyan)" }}>EXPIRY (MM/YY)</label>
            <input 
              ref={expRef} 
              type="text" 
              placeholder="12/28" 
              style={{ ...inputStyle, borderColor: errors.exp ? "var(--neon-pink)" : inputStyle.border }} 
              className="focus-visible:ring-4 focus-visible:ring-[var(--neon-yellow)]"
            />
            {errors.exp && <p className="mt-2 text-xl font-bold" style={{ color: "var(--neon-pink)" }}>{errors.exp}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-xl tracking-[0.2em] mb-3" style={{ color: "var(--neon-cyan)" }}>CVV</label>
            <input 
              ref={cvvRef} 
              type="text" 
              placeholder="123" 
              style={{ ...inputStyle, borderColor: errors.cvv ? "var(--neon-pink)" : inputStyle.border }} 
              className="focus-visible:ring-4 focus-visible:ring-[var(--neon-yellow)]"
            />
            {errors.cvv && <p className="mt-2 text-xl font-bold" style={{ color: "var(--neon-pink)" }}>{errors.cvv}</p>}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full mt-10 py-8 text-4xl font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95"
          style={{ 
            background: "var(--neon-cyan)", 
            color: "#000", 
            boxShadow: "0 0 40px var(--neon-cyan)",
            borderRadius: "16px"
          }}
        >
          START 7-DAY TRIAL
        </button>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// MAIN APP COMPONENT
// ----------------------------------------------------------------------
export default function Home() {
  const [category, setCategory] = useState<Category | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [favorites, setFavorites] = useLocalStorage<string[]>("czb_favorites", []);
  const [favDetails, setFavDetails] = useLocalStorage<Record<string, FavDetail>>("czb_fav_details", {});
  
  // NEW STATE: Trial Logic
  const [searchCount, setSearchCount] = useLocalStorage<number>("czb_search_count", 0);
  const [hasTrial, setHasTrial] = useLocalStorage<boolean>("czb_has_trial", false);

  const MAX_FREE_SEARCHES = 10;
  const requiresTrial = searchCount >= MAX_FREE_SEARCHES && !hasTrial;

  const generate = useCallback(() => {
    if (!category) return;
    setLoading(true);
    setRecs([]);
    
    setTimeout(() => {
      setRecs(getRecommendations(category, 10));
      setLoading(false);
      setHasGenerated(true);
      
      // Increment search count
      setSearchCount((prev) => prev + 1);
    }, 1800);
  }, [category, setSearchCount]);

  const toggleFav = useCallback(
    (rec: Recommendation) => {
      if (!category) return;
      const cat = category;
      setFavorites((prev) => {
        const has = prev.includes(rec.id);
        return has ? prev.filter((id) => id !== rec.id) : [...prev, rec.id];
      });
      setFavDetails((prev) => {
        if (prev[rec.id]) {
          const next = { ...prev };
          delete next[rec.id];
          return next;
        }
        return { ...prev, [rec.id]: { title: rec.title, category: cat } };
      });
    },
    [category, setFavorites, setFavDetails]
  );

  useEffect(() => {
    if (hasGenerated) {
      setRecs([]);
      setHasGenerated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const cfg = category ? CATEGORY_CONFIG[category] : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--dark-bg, #050505)" }}>
      <div className="scanlines" />
      <div className="noise-overlay" />

      {/* RENDER TRIAL CHECKOUT IF LIMIT REACHED */}
      {requiresTrial ? (
        <div className="min-h-screen flex items-center justify-center z-50 relative pt-20">
          <TrialCheckout onTrialSuccess={() => setHasTrial(true)} />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 pb-16 relative z-10">
          <GlitchTitle />
          <Marquee />

          <p className="text-center text-xs sm:text-sm leading-relaxed mx-auto max-w-lg my-4"
            style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>
            {">"} SELECT A CATEGORY. RECEIVE SOMETHING STATISTICALLY OPPOSITE TO WHAT THE ALGORITHM WANTS YOU TO CONSUME.
          </p>
          
          <p className="text-center text-[10px] tracking-widest font-black" style={{ color: "var(--neon-yellow)" }}>
            FREE SEARCHES REMAINING: {MAX_FREE_SEARCHES - searchCount} / {MAX_FREE_SEARCHES}
          </p>

          <CategorySelector selected={category} onSelect={setCategory} />

          <div className="flex justify-center my-8">
            <button
              className="btn-glitch px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg"
              style={{ letterSpacing: "0.18em", pointerEvents: !category || loading ? "none" : "auto", opacity: !category || loading ? 0.4 : 1 }}
              onClick={generate}
              disabled={!category || loading}
            >
              {loading ? "SCANNING..." : hasGenerated ? "↺  REGENERATE" : "BREAK MY COMFORT ZONE"}
            </button>
          </div>

          {!category && (
            <p className="text-center text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(255,0,255,0.35)" }}>
              ↑ PICK A CATEGORY FIRST
            </p>
          )}

          {loading && <LoadingBars />}

          {!loading && recs.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${cfg?.glowColor ?? "transparent"}, transparent)` }} />
                <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: `var(${cfg?.cssVar ?? "--neon-pink"})`, opacity: 0.7 }}>
                  ANTI-MAINSTREAM PICKS
                </span>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(270deg, ${cfg?.glowColor ?? "transparent"}, transparent)` }} />
              </div>

              {recs.map((rec) => (
                <RecCard key={rec.id} rec={rec} category={category!}
                  isFav={favorites.includes(rec.id)} onToggleFav={() => toggleFav(rec)} />
              ))}

              <div className="text-center mt-6">
                <button className="text-xs tracking-[0.2em] uppercase hover:opacity-100 transition-opacity"
                  style={{ color: "rgba(255,255,255,0.25)" }} onClick={generate}>
                  ↺ SHOW DIFFERENT SUGGESTIONS
                </button>
              </div>
            </div>
          )}

          <FavoritesPanel favDetails={favDetails} onClear={() => { setFavorites([]); setFavDetails({}); }} />

          <div className="mt-12 text-center border-t pt-6" style={{ borderColor: "rgba(255,0,255,0.08)" }}>
            <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.12)" }}>
              // CURATED ANTI-MAINSTREAM DATABASE · NO ALGORITHMS WERE HARMED · LOCAL STORAGE ONLY //
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
