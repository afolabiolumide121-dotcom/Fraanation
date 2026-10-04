import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";

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
  const features = ["Your own profile & username", "Post pictures & moments", "Comment, like & follow", "Private chat with members", "Community discussions", "Safe — report & block tools"];
  return (
    <>
      <PageHero eyebrow="Members only · Coming soon" title="The Nation" sub="A space for the people who move with FRAANATION." />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-px bg-ink md:grid-cols-3">
          {features.map((f, i) => (
            <div key={f} className="bg-background p-6">
              <p className="eyebrow text-muted-foreground">0{i + 1}</p>
              <p className="font-display mt-4 text-2xl">{f}</p>
            </div>
          ))}
        </div>
        <button disabled className="btn-sun mt-10">Membership opening soon</button>
      </section>
    </>
  );
}
