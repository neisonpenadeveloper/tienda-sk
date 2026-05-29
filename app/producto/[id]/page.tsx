import type { Metadata } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tiendasyk.store";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getProduct(id: string) {
  if (!UUID_RE.test(id)) return null;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=name,description,price,images&is_active=eq.true&limit=1`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] ?? null;
}

function formatCOP(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Producto | Tienda S&K",
      description: "Descubre productos en Tienda S&K",
    };
  }

  const price = formatCOP(product.price);
  const image: string | undefined = Array.isArray(product.images) ? product.images[0] : undefined;
  const description = product.description
    ? `${product.description.slice(0, 120)} — ${price}`
    : `${product.name} — ${price}`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} — ${price}`,
      description,
      siteName: "Tienda S&K",
      url: `${APP_URL}/producto/${id}`,
      type: "website",
      locale: "es_CO",
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: product.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — ${price}`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const safeId = UUID_RE.test(id) ? id : "";
  const target = `/?p=${safeId}`;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <script
        dangerouslySetInnerHTML={{ __html: `window.location.replace(${JSON.stringify(target)});` }}
      />
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
          fontFamily: "sans-serif",
          color: "#1A1A1A",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <p style={{ margin: 0, fontSize: "1rem", color: "#9B948E" }}>Cargando producto…</p>
      </div>
    </>
  );
}
