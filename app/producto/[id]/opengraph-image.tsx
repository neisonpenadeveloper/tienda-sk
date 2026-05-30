import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getProduct(id: string) {
  if (!UUID_RE.test(id)) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=name,price,images&is_active=eq.true&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const [p] = await res.json();
    return p ?? null;
  } catch {
    return null;
  }
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

function toDataUrl(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  const isWebP =
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45;
  const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50;
  const mime = isWebP ? "image/webp" : isPNG ? "image/png" : "image/jpeg";
  // Convert to base64 in chunks to avoid call stack limits
  let b64 = "";
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    b64 += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:${mime};base64,${btoa(b64)}`;
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  let imgSrc: string | null = null;
  const rawImgUrl: string | undefined = Array.isArray(product?.images)
    ? product.images[0]
    : undefined;

  if (rawImgUrl) {
    try {
      const r = await fetch(rawImgUrl);
      const buf = await r.arrayBuffer();
      imgSrc = toDataUrl(buf);
    } catch {
      /* sin imagen */
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0F172A",
        }}
      >
        {imgSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            style={{ width: 630, height: 630, objectFit: "cover", flexShrink: 0 }}
            alt=""
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px",
            flex: 1,
            gap: "14px",
          }}
        >
          <span style={{ fontSize: 22, color: "#93C5FD", fontWeight: 600 }}>
            Tienda S&K
          </span>
          <span
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.2,
            }}
          >
            {product?.name ?? "Producto"}
          </span>
          {product && (
            <span style={{ fontSize: 50, fontWeight: 900, color: "#2563EB" }}>
              {fmt(product.price)}
            </span>
          )}
          <span style={{ fontSize: 16, color: "#475569", marginTop: 8 }}>
            tiendasyk.store
          </span>
        </div>
      </div>
    )
  );
}
