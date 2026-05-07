import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import anime from "animejs";
import {
  Zap, ArrowRight, Play, Shield, Users, MessageSquare,
  Globe, Award, Clock, ThumbsUp, ThumbsDown, Mic,
  Bomb, Skull, Flame, Ghost, Brain, Trash2
} from "lucide-react";
import "../CSS/landing.css";

/* ═══════════════════════════════════════════════════
   CHAOS ARENA BACKGROUND
   Kinetic typography and physics-based geometric chaos
   ═══════════════════════════════════════════════════ */
function ChaosBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Generate some floating chaotic elements
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < 20; i++) {
      const el = document.createElement("div");
      el.className = "chaos-particle";
      el.style.left = Math.random() * 100 + "%";
      el.style.top = Math.random() * 100 + "%";
      el.style.width = Math.random() * 100 + 50 + "px";
      el.style.height = el.style.width;
      el.style.border = "2px solid rgba(255,255,255,0.05)";
      el.style.position = "absolute";
      el.style.borderRadius = i % 2 === 0 ? "50%" : "0";
      container.appendChild(el);
    }

    anime({
      targets: ".chaos-particle",
      translateX: () => anime.random(-100, 100),
      translateY: () => anime.random(-100, 100),
      rotate: () => anime.random(-180, 180),
      scale: () => [0.8, 1.2],
      duration: () => anime.random(3000, 5000),
      delay: anime.stagger(200),
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine"
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 chaos-grid" style={{ zIndex: -1, background: 'var(--chaos-bg)' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const [demoVote, setDemoVote] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const heroTextRef = useRef(null);

  const loadingMessages = [
    "Inflating egos...",
    "Polishing logical fallacies...",
    "Ignoring your opponent's valid points...",
    "Ready for the carnage."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingStep(s => (s < loadingMessages.length - 1 ? s + 1 : s));
    }, 1200);

    // Anime.js entry for hero headline
    if (heroTextRef.current) {
      anime({
        targets: '.hero-headline .char',
        translateY: [100, 0],
        opacity: [0, 1],
        delay: anime.stagger(30),
        easing: 'easeOutExpo',
        duration: 1200
      });
    }

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen text-white overflow-x-hidden selection:bg-pink-500" style={{ background: 'var(--chaos-bg)' }}>
      <ChaosBackground />

      {/* ── Top Bar ── */}
      <nav className="p-6 flex justify-between items-center relative z-10">
        <div className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
          <Flame className="text-pink-500 fill-pink-500" />
          ARENA.AI
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2 font-bold hover:text-green-400 transition-colors">LOGIN</Link>
          <Link to="/register" className="brutal-btn brutal-btn-purple !py-2 !px-4">JOIN THE CHAOS</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <main className="relative z-10 px-6 pt-12 pb-24 max-w-7xl mx-auto flex flex-col items-center">

        {/* Sarcastic Loader */}
        <div className="mb-12 h-8 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          {loadingMessages[loadingStep]}
        </div>

        <div className="text-center mb-16">
          <h1 className="hero-headline text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] mb-8">
            <span className="block text-white">YOUR OPINION</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 italic">IS A WEAPON</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-zinc-400 font-medium leading-relaxed">
            Finally, a place where you can destroy strangers with logic,
            or just scream until the audience votes you out of existence.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col md:flex-row gap-6 mb-24">
          <Link to="/register" className="brutal-btn brutal-btn-green !text-xl scale-110 hover:scale-125">
            <Zap size={24} />
            ENTER THE COLISEUM
          </Link>
          <Link to="/dashboard" className="brutal-btn brutal-btn-pink !text-xl">
            <Play size={24} />
            WATCH THE CARNAGE
          </Link>
        </div>

        {/* Bento Grid Features */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">

          <div className="md:col-span-8 brutal-card !bg-purple-600 !text-white flex flex-col justify-between h-[400px]">
            <div>
              <h2 className="text-4xl font-black mb-4">LIVE VIDEO EXECUTION</h2>
              <p className="text-purple-100 text-lg">Face your opponent in real-time HD. Let them see the exact moment you dismantle their entire worldview.</p>
            </div>
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-16 h-16 rounded-full border-4 border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="user" />
                </div>
              ))}
              <div className="w-16 h-16 rounded-full border-4 border-black bg-green-400 text-black flex items-center justify-center font-black">12k+</div>
            </div>
          </div>

          <div className="md:col-span-4 brutal-card !bg-green-400 !text-black flex flex-col justify-between h-[400px]">
            <Brain size={64} strokeWidth={3} />
            <div>
              <h2 className="text-3xl font-black mb-2 uppercase">Ego Shielding</h2>
              <p className="font-bold opacity-80 italic">Optional. Not recommended if you want to win.</p>
            </div>
          </div>

          <div className="md:col-span-4 brutal-card !bg-white !text-black h-[350px] flex flex-col justify-center items-center text-center">
            <Bomb size={80} className="mb-6 animate-bounce" />
            <h3 className="text-2xl font-black uppercase">Timed Rebuttals</h3>
            <p className="font-bold text-zinc-500">Say what you need to say before the timer detonates your credibility.</p>
          </div>

          <div className="md:col-span-8 brutal-card !bg-pink-500 !text-white flex items-center gap-8 h-[350px]">
            <div className="hidden md:block">
              <Trash2 size={120} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-4xl font-black uppercase mb-4">The Verdict</h3>
              <p className="text-xl font-bold opacity-90">The audience is judge, jury, and executioner. Win votes or go home and cry to your cat.</p>
            </div>
          </div>

        </section>

        {/* Interactive "Choose Your Fighter" */}
        <section className="mt-32 w-full max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black tracking-tighter uppercase italic">Pick Your Side</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest">Today's Hot Mess: AI replacing artists</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <button
              onClick={() => setDemoVote('pro')}
              className={`flex-1 brutal-card !p-0 overflow-hidden group transition-all ${demoVote === 'pro' ? 'scale-105 border-green-400' : 'opacity-60'}`}
            >
              <div className="bg-green-400 p-8 flex justify-between items-center text-black">
                <h4 className="text-3xl font-black uppercase">PRO-AI</h4>
                <ThumbsUp size={32} />
              </div>
              <div className="p-8 text-black bg-white text-left font-bold italic leading-tight">
                "Art is gatekept by talent. AI democratizes creation. Cry more, painters."
              </div>
            </button>

            <button
              onClick={() => setDemoVote('con')}
              className={`flex-1 brutal-card !p-0 overflow-hidden group transition-all ${demoVote === 'con' ? 'scale-105 border-pink-500' : 'opacity-60'}`}
            >
              <div className="bg-pink-500 p-8 flex justify-between items-center text-white">
                <h4 className="text-3xl font-black uppercase">CON-AI</h4>
                <ThumbsDown size={32} />
              </div>
              <div className="p-8 text-black bg-white text-left font-bold italic leading-tight">
                "Stolen pixels aren't art. You're just generating slop. Go pick up a pencil."
              </div>
            </button>
          </div>

          <AnimatePresence>
            {demoVote && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 text-center"
              >
                <p className="text-xl font-black uppercase tracking-widest mb-6">Bold Choice. Now defend it in the real arena.</p>
                <Link to="/register" className="brutal-btn brutal-btn-yellow !text-2xl animate-pulse">
                  SIGN UP BEFORE YOU LOSE YOUR NERVE
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Stats Section with Humor */}
        <section className="mt-40 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-5xl font-black text-green-400">2.8K</div>
            <div className="font-bold text-zinc-500 uppercase text-xs tracking-tighter">Arguments Started</div>
          </div>
          <div>
            <div className="text-5xl font-black text-purple-500">12K</div>
            <div className="font-bold text-zinc-500 uppercase text-xs tracking-tighter">Egos Bruised</div>
          </div>
          <div>
            <div className="text-5xl font-black text-pink-500">0</div>
            <div className="font-bold text-zinc-500 uppercase text-xs tracking-tighter">Facts Actually Checked</div>
          </div>
          <div>
            <div className="text-5xl font-black text-blue-400">98%</div>
            <div className="font-bold text-zinc-500 uppercase text-xs tracking-tighter">Uptime (mostly)</div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-48 pt-12 border-t-4 border-white/10 w-full flex flex-col md:flex-row justify-between items-center gap-6 opacity-50 text-xs font-bold uppercase tracking-widest">
          <p>© 2025 ARENA.AI - BUILT FOR THE WRONG PEOPLE.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-pink-500">Manifesto</a>
            <a href="#" className="hover:text-green-400">Terms of Combat</a>
            <a href="#" className="hover:text-purple-500">Ego Support</a>
          </div>
        </footer>

      </main>
    </div>
  );
}

