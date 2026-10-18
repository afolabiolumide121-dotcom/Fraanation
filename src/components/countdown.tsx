import { useEffect, useState } from "react";

function useCountdown(target: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (now === null) return null;
  const d = Math.max(0, new Date(target).getTime() - now);
  return { live: d === 0, parts: [["Days", Math.floor(d / 864e5)], ["Hours", Math.floor(d / 36e5) % 24], ["Minutes", Math.floor(d / 6e4) % 60], ["Seconds", Math.floor(d / 1e3) % 60]] as const };
}

export function Countdown({ target }: { target: string }) {
  const c = useCountdown(target);
  if (c?.live) return <p className="font-display text-6xl md:text-8xl">After Dark <span className="text-sun">is live.</span></p>;
  return (
    <div className="grid grid-cols-4 border-t border-ink-foreground/20">
      {(c?.parts ?? [["Days", 0], ["Hours", 0], ["Minutes", 0], ["Seconds", 0]]).map(([l, v], i) => (
        <div key={l} className={`pt-4 ${i ? "border-l border-ink-foreground/20 pl-3 md:pl-6" : ""}`}>
          <p className="font-display text-5xl tabular-nums md:text-8xl">{String(v).padStart(2, "0")}</p>
          <p className="eyebrow mt-2 opacity-60">{l}</p>
        </div>
      ))}
    </div>
  );
}
