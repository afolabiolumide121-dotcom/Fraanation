import { createFileRoute, Link } from "@tanstack/react-router";
import { crowdImage } from "@/lib/brand-data";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — FRAANATION" },
      { name: "description", content: "The FRAANATION members community: profiles, posts, photos and event chat." },
      { property: "og:title", content: "Community — FRAANATION" },
      { property: "og:description", content: "A members-only space for the nation." },
    ],
  }),
  component: Community,
});

function Community() {
  const features = ["Your profile & username", "Posts & pictures", "Comments & likes", "After Dark event chat", "Report anything — we moderate"];
  return (
    <>
      <section className="px-3 pt-3 md:px-6 md:pt-6">
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-ink text-ink-foreground">
          <img src={crowdImage} alt="FRAANATION members" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="relative px-6 pb-14 pt-32 md:px-16 md:pb-24 md:pt-48">
            <p className="eyebrow text-sun">Members only — now open</p>
            <h1 className="font-head rise mt-6 text-[clamp(3.5rem,16vw,11rem)]">The<br />Nation<span className="text-sun">.</span></h1>
            <p className="font-editorial rise mt-4 max-w-lg text-2xl md:text-4xl">A private space for the people who move with FRAANATION.</p>
            <Link to="/auth" className="btn-sun mt-10 w-full md:w-auto">Join the Nation <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
        <ul className="border-t border-ink/10">
          {features.map((f) => (
            <li key={f} className="border-b border-ink/10 py-5 md:py-7">
              <span className="font-head text-3xl md:text-5xl">{f}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
