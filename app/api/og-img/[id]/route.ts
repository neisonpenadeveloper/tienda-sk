import type { NextRequest } from "next/server";
import sharp from "sharp";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) return new Response("Not found", { status: 404 });

  const buffer = Buffer.from(await imgRes.arrayBuffer());

  // Convierte cualquier formato (WebP, PNG, etc.) a JPEG — WhatsApp solo acepta JPEG/PNG en OG
  const jpeg = await sharp(buffer).jpeg({ quality: 82 }).toBuffer();

  return new Response(jpeg, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
