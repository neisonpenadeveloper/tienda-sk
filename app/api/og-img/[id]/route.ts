import type { NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function detectMime(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf);
  // WebP: RIFF????WEBP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  // PNG: \x89PNG
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  // JPEG: \xFF\xD8
  if (b[0] === 0xff && b[1] === 0xd8) return "image/jpeg";
  // GIF: GIF8
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return "image/gif";
  return "image/jpeg";
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return new Response("Not found", { status: 404 });

  const prodRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=images&is_active=eq.true&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, next: { revalidate: 3600 } }
  );
  if (!prodRes.ok) return new Response("Not found", { status: 404 });

  const [product] = await prodRes.json();
  const imgUrl: string | undefined = Array.isArray(product?.images) ? product.images[0] : undefined;
  if (!imgUrl) return new Response("Not found", { status: 404 });

  const imgRes = await fetch(imgUrl, { next: { revalidate: 3600 } });
  if (!imgRes.ok) return new Response("Not found", { status: 404 });

  const buffer = await imgRes.arrayBuffer();
  const contentType = detectMime(buffer);

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
