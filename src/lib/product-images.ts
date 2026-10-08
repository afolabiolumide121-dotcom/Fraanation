import tee from "@/assets/tee.jpg";
import shorts from "@/assets/shorts.jpg";
import hat from "@/assets/hat.jpg";
import lookTee from "@/assets/look-tee.jpg";
import poolDress from "@/assets/pool-dress.jpg";

const map: Record<string, string> = { tee, shorts, hat, "look-tee": lookTee, "pool-dress": poolDress };
export const productImage = (key: string) => map[key] ?? tee;
