import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LookupForm, mapsUrl } from "@/components/registration-form";
import { ReserveButton } from "@/components/reserve-dialog";
import { Countdown } from "@/components/countdown";
import { fetchEvent } from "@/lib/reservation";
import { heroImage, crowdImage, lookTeeImage, poolParty } from "@/lib/brand-data";
import type { EventRow } from "@/lib/events.functions";

const eventQuery = queryOptions({ queryKey: ["event", "pool-party"], queryFn: fetchEvent });

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "FRAANATION After Dark — 25.11.26 · The Grand Elysium, Lagos" },
      { name: "description", content: "FRAANATION After Dark. Nov 25, 2026, 9PM till dawn at The Grand Elysium, Idimu, Lagos. Free entry by reservation." },
      { property: "og:title", content: "FRAANATION After Dark — Where the night gets wet." },
      { property: "og:description", content: "Nov 25 · 9PM till dawn · The Grand Elysium, Lagos. Free entry — reserve your spot." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventQuery).catch(() => null),
  errorComponent: ({ error }) => (
    <div className="p-10">
      <p>Couldn't load the event. Please refresh.</p>
      <p className="mt-4 break-words text-xs opacity-60">Details: {String((error as Error)?.message ?? error).slice(0, 300)}</p>
    </div>
  ),
  notFoundComponent: () => <p className="p-10">Event not found.</p>,
  component: Splash,
});

function Splash() {
  const { data } = useSuspenseQuery(eventQuery);
  const ev: EventRow = data ?? {
    id: "", slug: "pool-party", title: poolParty.title, tagline: poolParty.tagline, date_text: poolParty.date, month_text: poolParty.month,
    venue: poolParty.venue, city: poolParty.city, price_text: poolParty.price, details: poolParty.details, registration_open: false,
    starts_at: poolParty.startsAt, time_text: poolParty.time, address: poolParty.address, max_guests_per_reservation: 4,
  };
  const full = `${ev.venue}, ${ev.address}`;

  return (
    <div className="bg-ink text-ink-foreground">
      {/* HERO */}
      <section className="relative -mt-px min-h-[100svh] overflow-hidden">
        <img src={heroImage} alt="FRAANATION After Dark" width={1088} height={1440} className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pb-10 pt-24 md:px-10 md:pb-16">
          <p className="eyebrow rise"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-sun align-middle" />FRAANATION presents</p>
          <h1 className="font-display rise mt-4 text-[38vw] leading-[0.78] md:text-[22rem]" style={{ animationDelay: "80ms" }}>
            After<br />Dark<span className="text-sun">.</span>
          </h1>
          <p className="font-editorial rise mt-4 text-3xl md:text-5xl" style={{ animationDelay: "160ms" }}>Where the night gets wet.</p>
          <div className="rise mt-8 grid grid-cols-2 gap-y-3 border-t border-ink-foreground/25 pt-5 md:grid-cols-4" style={{ animationDelay: "240ms" }}>
            {["25.11.26", "9PM — Till dawn", ev.venue, ev.city].map((x) => <p key={x} className="eyebrow">{x}</p>)}
          </div>
          <p className="eyebrow rise mt-6" style={{ animationDelay: "300ms" }}><span className="bg-sun px-2 py-1 text-ink">Free entry</span> <span className="ml-2">Reservation required</span></p>
          <div className="rise mt-8 grid gap-3 md:flex" style={{ animationDelay: "360ms" }}>
            <ReserveButton className="btn-light w-full md:w-auto" />
            <Link to="/" className="btn-ink w-full border border-ink-foreground/30 md:w-auto">Explore FRAANATION <span>→</span></Link>
          </div>
        </div>
      </section>

      {/* COUNTDOWN */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
        <p className="eyebrow mb-6 text-sun">Until doors open</p>
        <Countdown target={ev.starts_at ?? poolParty.startsAt} />
      </section>

      {/* EXPERIENCE */}
      <section className="bg-background text-foreground">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 md:grid-cols-12 md:px-10 md:py-32">
          <p className="eyebrow md:col-span-3">(01) The experience</p>
          <p className="font-editorial text-4xl leading-tight md:col-span-8 md:text-6xl">
            After Dark is where FRAANATION brings entertainment, fashion, music, people and energy together for <span className="font-display not-italic">one unforgettable night.</span>
          </p>
          <ol className="border-t hairline md:col-span-8 md:col-start-4">
            {ev.details.map((d, i) => (
              <li key={d} className="flex gap-6 border-b hairline py-5"><span className="eyebrow pt-1 text-muted-foreground">0{i + 1}</span><span className="text-lg">{d}</span></li>
            ))}
          </ol>
        </div>
      </section>

      {/* RESERVE — form first, details beside/below */}
      <section id="reserve" className="mx-auto max-w-[1400px] scroll-mt-16 px-5 py-20 md:px-10 md:py-32">
        <div className="grid gap-16 md:grid-cols-12">
          <div id="register" className="scroll-mt-16 md:col-span-5">
            <div className="bg-paper p-6 text-ink">
              <p className="eyebrow"><span className="bg-sun px-2 py-1">Free entry</span></p>
              <h2 className="font-display mt-5 text-6xl leading-[0.9]">Your night.<br />Your <span className="font-editorial text-5xl normal-case">invitation.</span></h2>
              <p className="mt-4 text-sm text-muted-foreground">Takes 30 seconds. Get your ticket instantly and save it to your phone.</p>
              <ReserveButton className="btn-ink mt-6 w-full" />
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="eyebrow text-sun">(02) The details</p>
            <dl className="mt-8 border-t border-ink-foreground/25">
              {[["Date", ev.date_text], ["Time", ev.time_text], ["Venue", ev.venue], ["Location", ev.address], ["Entry", "Free"], ["Access", "By reservation"]].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 border-b border-ink-foreground/15 py-4">
                  <dt className="eyebrow pt-1 opacity-60">{k}</dt>
                  <dd className="col-span-2 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm opacity-70">Host: Holluster · Sponsorship / enquiries: <a className="link-draw" href="https://wa.me/2349082556742">WhatsApp 09082556742</a></p>
            <a href={mapsUrl(full)} target="_blank" rel="noreferrer" className="btn-light mt-8 w-full md:w-auto">Get directions <span>→</span></a>
          </div>
        </div>
      </section>

      {/* FASHION */}
      <section className="bg-background text-foreground">
        <div className="mx-auto grid max-w-[1400px] items-end gap-8 px-5 py-20 md:grid-cols-12 md:px-10 md:py-32">
          <div className="group overflow-hidden md:col-span-6">
            <img src={lookTeeImage} alt="FRAA Signature Tee" loading="lazy" className="img-editorial aspect-[4/5] w-full object-cover object-top" />
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="eyebrow">(03) The fashion layer</p>
            <h2 className="font-display mt-4 text-7xl md:text-8xl">What are you wearing?</h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">The FRAA Collection is the dress code you don't have to be told. Every piece carries the signature.</p>
            <Link to="/collection" className="btn-ink mt-8 w-full md:w-auto">Shop the FRAA collection <span>→</span></Link>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="relative overflow-hidden">
        <img src={crowdImage} alt="FRAANATION crowd" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-40">
          <p className="eyebrow text-sun">(04) Members only</p>
          <h2 className="font-display mt-4 max-w-4xl text-6xl md:text-9xl">The night doesn't start at the venue.</h2>
          <p className="font-editorial mt-6 max-w-xl text-2xl">Meet the crowd before the doors open — inside the FRAANATION community.</p>
          <Link to="/community" className="btn-light mt-10 w-full md:w-auto">Join FRAANATION <span>→</span></Link>
        </div>
      </section>

      {/* LOOKUP */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-md px-5 py-16"><LookupForm /></div>
      </section>
    </div>
  );
}
