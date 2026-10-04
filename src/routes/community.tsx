import { createFileRoute } from "@tanstack/react-router";
import { crowdImage } from "@/lib/brand-data";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — FRAANATION" },
      { name: "description", content: "The FRAANATION members community: profiles, posts, follows and private chat." },
      { property: "og:title", content: "Community — FRAANATION" },
      { property: "og:description", content: "A members-only space for the nation." },
    ],
  }),
  component: Community,
});

function Community() {
  const features = ["Your profile & username", "Posts & pictures", "Comments, likes & follows", "Community discussions", "Private messages", "Report & block — kept safe"];
  return (
    <div className="bg-ink text-ink-foreground">
      <section className="relative overflow-hidden">
        <img src={crowdImage} alt="FRAANATION members" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-10 md:pb-28 md:pt-40">
          <p className="eyebrow text-sun">Members only — opening soon</p>
          <h1 className="font-display rise mt-6 text-[26vw] md:text-[14rem]">The<br />Nation</h1>
          <p className="font-editorial rise mt-4 max-w-lg text-3xl md:text-4xl">A private space for the people who move with FRAANATION.</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
        <ul className="border-t border-ink-foreground/15">
          {features.map((f, i) => (
            <li key={f} className="flex items-baseline justify-between border-b border-ink-foreground/15 py-5 md:py-7">
              <span className="font-display text-4xl md:text-6xl">{f}</span>
              <span className="eyebrow opacity-40">0{i + 1}</span>
            </li>
          ))}
        </ul>
        <button disabled className="btn-light mt-10 w-full md:w-auto">Membership opening soon <span>→</span></button>
      </section>
    </div>
  );
}
