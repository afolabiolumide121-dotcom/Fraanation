import tee from "@/assets/tee.jpg";
import shorts from "@/assets/shorts.jpg";
import hat from "@/assets/hat.jpg";
import hero from "@/assets/hero.jpg";
import lookTee from "@/assets/look-tee.jpg";
import crowd from "@/assets/crowd.jpg";

export const heroImage = hero;
export const lookTeeImage = lookTee;
export const crowdImage = crowd;

// Fallback event info (live values come from the database).
export const poolParty = {
  title: "FRAA SPLASH",
  tagline: "The night starts here.",
  date: "November 25, 2026",
  month: "Nov 25, 2026",
  time: "9:00 PM — Till Dawn",
  venue: "The Grand Elysium",
  address: "9 Taiye Odunjo St., Behind Grace Hotel, Idimu, Lagos",
  city: "Lagos",
  price: "Free",
  startsAt: "2026-11-25T21:00:00+01:00",
  details: [
    "Free entry — reservation required",
    "Music, fashion and people — one night, till dawn",
    "The FRAA Collection, worn by the crowd",
    "Dress code: bold, poolside, unmistakably you",
  ],
};

export type Product = {
  id: string; name: string; price: number; image: string;
  signature: string; colours: string[]; sizes: string[]; stock: number; description: string;
};

export const products: Product[] = [
  { id: "fraa-heavy-tee", name: "FRAA Heavyweight Tee", price: 25000, image: tee,
    signature: "Embroidered FRAA chest mark", colours: ["Black", "White"], sizes: ["S", "M", "L", "XL"], stock: 24,
    description: "Oversized 280gsm cotton with a raised yellow FRAA embroidery and woven neck label." },
  { id: "fraa-swim-short", name: "FRAA Pool Short", price: 18000, image: shorts,
    signature: "FRAA leg embroidery", colours: ["Sun Yellow", "Black"], sizes: ["S", "M", "L", "XL"], stock: 8,
    description: "Quick-dry swim short built for the pool and the after-party. Mesh lined, drawcord waist." },
  { id: "fraanation-bucket", name: "FRAANATION Bucket Hat", price: 12000, image: hat,
    signature: "FRAANATION front embroidery", colours: ["White", "Black"], sizes: ["One size"], stock: 3,
    description: "Structured cotton twill bucket with the full FRAANATION wordmark stitched up front." },
];

export const formatNaira = (n: number) => "₦" + n.toLocaleString("en-NG");
