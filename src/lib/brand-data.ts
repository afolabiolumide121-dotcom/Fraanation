import tee from "@/assets/tee.jpg";
import shorts from "@/assets/shorts.jpg";
import hat from "@/assets/hat.jpg";
import hero from "@/assets/hero.jpg";
import lookTee from "@/assets/look-tee.jpg";
import crowd from "@/assets/crowd.jpg";

export const heroImage = hero;
export const lookTeeImage = lookTee;
export const crowdImage = crowd;

// Editable event info — date & venue not confirmed yet.
export const poolParty = {
  title: "The Pool Party",
  tagline: "Free entry. Summer on full volume.",
  date: "TBA",
  month: "Next month",
  venue: "Venue to be revealed",
  city: "Lagos",
  price: "Free",
  details: [
    "Free entry — registration required",
    "DJs, music and summer energy all day",
    "First look at THE FRAANATION COLLECTION",
    "Dress code: poolside, bold, unmistakably you",
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
