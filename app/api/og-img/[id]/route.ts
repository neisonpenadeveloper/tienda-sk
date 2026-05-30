import type { NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Proxy simple: descarga la imagen de Supabase y la sirve desde el mismo dominio.
// El canvas del browser puede dibujarla (WebP/PNG/JPEG), luego convierte a JPEG con toBlob.
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

  const buffer = await imgRes.arrayBuffer();

  // Detectar tipo real por magic bytes (el archivo puede ser WebP con extension .png)
  const b = new Uint8Array(buffer);
  let ct = "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50) ct = "image/png";
  else if (b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45) ct = "image/webp";
  else if (b[0] === 0xff && b[1] === 0xd8) ct = "image/jpeg";

  return new Response(buffer, {
    headers: {
      "Content-Type": ct,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
