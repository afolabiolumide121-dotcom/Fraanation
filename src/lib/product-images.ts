import tee from "@/assets/tee.jpg";
import shorts from "@/assets/shorts.jpg";
import hat from "@/assets/hat.jpg";
import lookTee from "@/assets/look-tee.jpg";

const map: Record<string, string> = { tee, shorts, hat, "look-tee": lookTee };
export const productImage = (key: string) => map[key] ?? tee;
