"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScanResult {
  verdict: string;
  riskScore: number;
  threatsDetected: string[];
  latencyMs: number;
  recommendations: string[];
}

const DEMO_KEY = "sentinel-demo-key-2026";
const API_URL = "https://api-proxy-production-28ff.up.railway.app/v1/inspect";

export default function LiveDemo() {
  const [url, setUrl] = useState("https://httpbin.org/post");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [_error, setError] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-8), `> ${msg}`]);
  };

  const handleScan = async () => {
    setLoading(true);
    setResult(null);
    setError("");
    setLogs([]);

    const steps = [
      "Initializing neural engine...",
      "Parsing target endpoint...",
      "Analyzing headers & SSL...",
      "Detecting XSS vectors...",
      "Checking SQL injection patterns...",
      "Scanning for SSRF vulnerabilities...",
      "Calculating risk score...",
      "Generating report...",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
      addLog(steps[i]);
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sentinel-Api-Key": DEMO_KEY,
        },
        body: JSON.stringify({
          url,
          method: "POST",
          headers: {},
          body: JSON.stringify({ test: "sentinel-demo" }),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
      addLog(`✓ Scan complete. Verdict: ${data.verdict}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
      addLog("✗ Connection failed. Using simulated data...");
      // Fallback simulado para demo
      setResult({
        verdict: "ALLOW",
        riskScore: 12,
        threatsDetected: [],
        latencyMs: 21,
        recommendations: ["Add CSP header", "Enable HSTS"],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section id="demo" className="py-24 px-6 relative">
      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.1) 2px, rgba(0,240,255,0.1) 4px)",
          backgroundSize: "100% 4px"
        }} 
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-fuchsia-400 text-xs uppercase tracking-[0.3em] mb-4 block">Live Demo</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Try it <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">now</span>
          </h2>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
            Enter any API endpoint and watch Sentinel analyze it in real-time.
          </p>
        </motion.div>

        {/* Input + Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8"
        >
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm">$</div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-4 pl-10 pr-4 text-sm font-mono text-cyan-400 focus:border-cyan-500/50 focus:outline-none focus:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-all"
              placeholder="https://api.example.com/endpoint"
            />
          </div>
          <button
            onClick={handleScan}
            disabled={loading}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-black font-bold hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Scanning...
              </span>
            ) : (
              "⚡ Scan Endpoint"
            )}
          </button>
        </motion.div>

        {/* Terminal Output */}
        <AnimatePresence>
          {(logs.length > 0 || result) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl overflow-hidden border border-white/10 bg-[#050508] shadow-2xl"
            >
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a12] border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-4 text-xs text-zinc-600 font-mono">sentinel-scan — bash — live</span>
              </div>

              {/* Logs */}
              <div ref={terminalRef} className="p-6 font-mono text-sm leading-relaxed max-h-64 overflow-y-auto">
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`mb-1 ${
                      log.includes("✓") ? "text-green-400" : 
                      log.includes("✗") ? "text-red-400" : 
                      "text-zinc-400"
                    }`}
                  >
                    {log}
                    {i === logs.length - 1 && loading && (
                      <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
                    )}
                  </motion.div>
                ))}

                {/* Result JSON */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 pt-4 border-t border-white/5"
                  >
                    <div className="text-zinc-500">{`{`}</div>
                    <div className="text-zinc-300 ml-4">
                      "verdict": <span className={result.verdict === "ALLOW" ? "text-green-400" : "text-red-400"}>"{result.verdict}"</span>,
                    </div>
                    <div className="text-zinc-300 ml-4">
                      "riskScore": <span className={result.riskScore > 50 ? "text-red-400" : result.riskScore > 20 ? "text-yellow-400" : "text-green-400"}>{result.riskScore}</span>,
                    </div>
                    <div className="text-zinc-300 ml-4">
                      "threatsDetected": {result.threatsDetected.length === 0 ? (
                        <span className="text-green-400">[]</span>
                      ) : (
                        <span className="text-red-400">[{result.threatsDetected.join(", ")}]</span>
                      )},
                    </div>
                    <div className="text-zinc-300 ml-4">
                      "latencyMs": <span className="text-cyan-400">{result.latencyMs}</span>,
                    </div>
                    <div className="text-zinc-300 ml-4">
                      "recommendations": [
                      {result.recommendations.map((rec, i) => (
                        <span key={rec} className="text-yellow-400">"{rec}"{i < result.recommendations.length - 1 ? ", " : ""}</span>
                      ))}
                      ]
                    </div>
                    <div className="text-zinc-500">{`}`}</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
