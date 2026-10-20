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
  if (c?.live) return <p className="font-head text-5xl md:text-7xl">After Dark <span className="text-sun">is live.</span></p>;
  return (
    <div className="grid grid-cols-4 border-t hairline">
      {(c?.parts ?? [["Days", 0], ["Hours", 0], ["Minutes", 0], ["Seconds", 0]]).map(([l, v], i) => (
        <div key={l} className={`pt-4 ${i ? "border-l hairline pl-3 md:pl-6" : ""}`}>
          <p className="font-head text-[clamp(2.25rem,10vw,5.5rem)] tabular-nums">{String(v).padStart(2, "0")}</p>
          <p className="mt-2 text-xs opacity-60">{l}</p>
        </div>
      ))}
    </div>
  );
}
