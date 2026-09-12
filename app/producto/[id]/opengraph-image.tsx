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
      `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=name,price,images,category&is_active=eq.true&limit=1`,
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

/**
 * Convierte la URL pública de una foto en la de Supabase Image Transformation.
 *
 * Hace falta porque Satori —el motor detrás de ImageResponse— NO sabe
 * decodificar WebP, y muchísimas fotos de la tienda lo son: el bot optimiza a
 * WebP al publicar, y varias subidas a mano son WebP con nombre `.png`, así que
 * la extensión no sirve para detectarlas. Con una foto WebP dentro, la imagen
 * salía VACÍA (HTTP 200 pero 0 bytes) y WhatsApp no enseñaba nada.
 * Medido el 2026-09-11: 23 de 37 productos activos estaban así.
 *
 * La ruta `render/image/public` entrega JPEG cuando el original es WebP, y deja
 * igual los PNG y JPEG, que a Satori ya le sirven. Comprobado contra la tienda
 * real: 4/4 WebP salieron JPEG y 5/5 de los que ya funcionaban siguieron bien.
 *
 * Ojo si se cambia: `format=jpeg` NO existe, Supabase responde 400. Lo único
 * que decide el formato de salida es el del original.
 */
function urlLegiblePorSatori(url: string): string {
  return (
    url.replace("/object/public/", "/render/image/public/") +
    "?width=630&height=630&resize=cover"
  );
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const encontrado = await getProduct(id);
  // Los productos del Sex Shop se comparten con una imagen genérica de la
  // tienda: sin foto, nombre ni precio en la vista previa.
  const product = encontrado?.category === "adultos" ? null : encontrado;

  // Se pasa el ArrayBuffer tal cual, sin base64: Satori tiene un presupuesto de
  // 500 KB para TODO (JSX, fuentes e imagenes) y el base64 infla un 33%. Una de
  // las fotos PNG de la tienda pesa 315 KB, que en base64 serian ~432 KB: al
  // borde. Crudo cabe de sobra.
  let imgSrc: ArrayBuffer | null = null;
  const rawImgUrl: string | undefined = Array.isArray(product?.images)
    ? product.images[0]
    : undefined;

  if (rawImgUrl) {
    try {
      const r = await fetch(urlLegiblePorSatori(rawImgUrl));
      if (r.ok) {
        const buf = await r.arrayBuffer();

        // Ultima red de seguridad: si aun asi no llega un PNG o un JPEG, la
        // tarjeta se publica SIN foto. Vale mas una imagen con el nombre y el
        // precio que los 0 bytes que devolvia antes, que en WhatsApp se ven
        // igual que un enlace sin vista previa.
        const b = new Uint8Array(buf.slice(0, 4));
        const esPng = b[0] === 0x89 && b[1] === 0x50;
        const esJpeg = b[0] === 0xff && b[1] === 0xd8;
        if (esPng || esJpeg) imgSrc = buf;
      }
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
            // Satori acepta un ArrayBuffer aqui en tiempo de ejecucion; el tipo
            // de HTML solo admite string, de ahi la conversion.
            src={imgSrc as unknown as string}
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
