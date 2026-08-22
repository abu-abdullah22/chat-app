'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, MessageSquareText, Zap, Users, Lock, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  // Typing Animation State
  const [typingText, setTypingText] = useState('');
  const fullText = "Hey! Did you see the new chat app?";
  
  // Telemetry State
  const [latency, setLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    let i = 0;
    const typingInterval = setInterval(() => {
      if (!isMounted.current) return;
      if (i < fullText.length) {
        setTypingText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    // Live Telemetry Ping
    const pingServer = async () => {
      if (!isMounted.current) return;
      try {
        const start = Date.now();
        // Ping the root health endpoint to avoid the /api/health 404 bug!
        const res = await fetch('https://frontend-task-chatapp.onrender.com/health');
        const end = Date.now();
        if (res.ok && isMounted.current) {
          setLatency(end - start);
          setIsOnline(true);
        }
      } catch {
        if (isMounted.current) setIsOnline(false);
      }
    };

    pingServer();
    const pingInterval = setInterval(pingServer, 5000);

    return () => {
      isMounted.current = false;
      clearInterval(typingInterval);
      clearInterval(pingInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-60 pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] opacity-60 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl ring-1 ring-primary/20">
            <MessageSquareText className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight">NexusChat</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/login">
            <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium ring-1 ring-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            <span>Now with Real-Time Sync</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-muted-foreground animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Communication,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              Reimagined.
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Experience lightning-fast messaging, seamless group chats, and intelligent auto-scrolling wrapped in a beautifully modern interface.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                Try the Demo Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Interactive Mockup (The "Bonus" Element) */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-3xl rounded-[3rem]" />
          <div className="relative bg-card/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <h3 className="font-semibold">Alice</h3>
                <p className="text-xs text-primary">Online</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-sm text-sm">
                  Hey! Did you check out NexusChat?
                </div>
              </div>
              <div className="flex items-start gap-2 max-w-[80%] ml-auto justify-end">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm text-sm shadow-md">
                  Yeah, it&apos;s insanely fast! 🚀
                </div>
              </div>
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-sm text-sm relative">
                  {typingText}
                  <span className="absolute ml-1 w-1.5 h-4 bg-primary inline-block animate-pulse" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-background/50 rounded-full border border-white/10" />
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Bento Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl hover:bg-card/60 transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-blue-500/20">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-Time Sync</h3>
            <p className="text-muted-foreground">Messages appear instantly without refreshing. Powered by intelligent background polling.</p>
          </div>
          <div className="bg-card/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl hover:bg-card/60 transition-colors">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-purple-500/20">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Group Channels</h3>
            <p className="text-muted-foreground">Create dynamic groups with multiple participants and designated admins effortlessly.</p>
          </div>
          <div className="bg-card/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl hover:bg-card/60 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-emerald-500/20">
              <Lock className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Access</h3>
            <p className="text-muted-foreground">Simple phone-based authentication with instant provisioning. No complex signups.</p>
          </div>
        </div>
      </section>

      {/* Bonus Element: Live System Telemetry */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <div className="bg-gradient-to-r from-card/40 to-muted/20 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium ring-1 ring-primary/20">
              <Activity className="w-4 h-4" />
              <span>Live Telemetry</span>
            </div>
            <h3 className="text-3xl font-bold">Uncompromising Speed.</h3>
            <p className="text-muted-foreground max-w-md">
              We don&apos;t just promise real-time messaging, we prove it. This widget is directly pinging our production cluster API right now.
            </p>
          </div>
          
          <div className="flex-shrink-0 relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="relative bg-background/80 border border-white/10 rounded-2xl p-6 min-w-[200px] flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-500' : 'bg-destructive'}`}></span>
                </span>
                <span className="font-mono font-medium">{isOnline ? 'API Online' : 'Connecting...'}</span>
              </div>
              <div className="text-4xl font-extrabold tracking-tight">
                {latency !== null ? `${latency}` : '--'}<span className="text-lg text-muted-foreground font-medium ml-1">ms</span>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Response Time</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
