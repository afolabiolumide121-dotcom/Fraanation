import type { EventRow } from "@/lib/events.functions";
import type { Ticket } from "@/components/registration-form";

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > max && line) { ctx.fillText(line, x, y); line = w; y += lh; }
    else line = test;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}

export async function renderTicketImage(t: Ticket, ev: EventRow, qr: HTMLCanvasElement | null): Promise<Blob> {
  await Promise.all([
    document.fonts.load('120px "Anton"'),
    document.fonts.load('italic 40px "Bodoni Moda"'),
    document.fonts.load('600 32px "Archivo"'),
  ]).catch(() => {});
  const W = 1080, H = 1920, P = 80;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const INK = "#111111", SUN = "#FFD900", PAPER = "#FFFFFF";

  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, 820);
  ctx.fillStyle = PAPER; ctx.fillRect(0, 820, W, H - 820);

  ctx.fillStyle = PAPER; ctx.font = '600 30px "Archivo", sans-serif';
  ctx.fillText("FRAANATION PRESENTS", P, 130);
  ctx.fillStyle = SUN; ctx.textAlign = "right";
  ctx.fillText(`ADMIT ${t.guests}`, W - P, 130); ctx.textAlign = "left";

  ctx.fillStyle = PAPER; ctx.font = '260px "Anton", sans-serif';
  ctx.fillText("AFTER", P - 6, 430);
  ctx.fillText("DARK", P - 6, 680);
  const dw = ctx.measureText("DARK").width;
  ctx.fillStyle = SUN; ctx.fillText(".", P - 6 + dw, 680);
  ctx.fillStyle = PAPER; ctx.font = 'italic 48px "Bodoni Moda", serif';
  ctx.fillText(ev.tagline, P, 770);

  const label = (s: string, x: number, y: number) => { ctx.fillStyle = "#777"; ctx.font = '600 24px "Archivo", sans-serif'; ctx.fillText(s.toUpperCase(), x, y); };
  const val = (s: string, x: number, y: number, size = 40) => { ctx.fillStyle = INK; ctx.font = `600 ${size}px "Archivo", sans-serif`; ctx.fillText(s, x, y); };

  label("Date", P, 920); val(ev.date_text, P, 975);
  label("Time", W / 2, 920); val(ev.time_text, W / 2, 975);

  ctx.fillStyle = INK; ctx.fillRect(P, 1030, W - 2 * P, 2);
  label("Your destination", P, 1090);
  ctx.fillStyle = INK; ctx.font = '84px "Anton", sans-serif';
  let y = wrap(ctx, ev.venue.toUpperCase(), P, 1185, W - 2 * P, 90);
  ctx.font = '34px "Archivo", sans-serif';
  y = wrap(ctx, ev.address, P, y + 5, W - 2 * P, 46);
  ctx.fillRect(P, y + 10, W - 2 * P, 2);

  label("Guest", P, y + 80);
  ctx.fillStyle = INK; ctx.font = '600 40px "Archivo", sans-serif';
  wrap(ctx, t.fullName, P, y + 135, W / 2 - P - 20, 48);
  label("Entry", W / 2, y + 80); val("Free", W / 2, y + 135);

  // perforation
  const py = 1520;
  ctx.setLineDash([18, 14]); ctx.strokeStyle = "#bbb"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke(); ctx.setLineDash([]);

  if (qr) ctx.drawImage(qr, P, py + 60, 300, 300);
  const tx = P + 340;
  label("Reservation", tx, py + 110);
  ctx.fillStyle = INK; ctx.font = '96px "Anton", sans-serif';
  ctx.fillText(t.code, tx, py + 215);
  ctx.fillStyle = SUN; ctx.fillRect(tx, py + 250, 420, 56);
  ctx.fillStyle = INK; ctx.font = '600 26px "Archivo", sans-serif';
  ctx.fillText("RESERVATION CONFIRMED", tx + 16, py + 288);

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("render failed"))), "image/png"));
}
