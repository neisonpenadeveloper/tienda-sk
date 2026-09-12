import type { Metadata } from "next";
import { Roboto, Exo_2 } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const exo2 = Exo_2({
  variable: "--font-azonix",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

// Poppins se retiro el 2026-09-12: se descargaba entera en cada visita para
// DOS textos de la portada ("nosotros te lo llevamos", en el hero movil y en
// el de escritorio). Ambos usan ya Roboto, que a ese tamano no se distingue.
// Una familia menos que bajar en cada carga movil.

// DM Sans se movio el 2026-09-12 a app/checkout/result/layout.jsx, que es la
// unica ruta que la usa. Aqui se descargaba en cada visita a la portada para
// una pagina que solo se ve despues de pagar. Sigue auto-hospedada con
// next/font, asi que la CSP la sigue permitiendo igual.

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://tiendasyk.store";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Tienda S&K — Hogar, Cuidado Personal y Juguetes",
    template: "%s | Tienda S&K",
  },
  description:
    "Descubre productos de hogar, cuidado personal y juguetes con los mejores precios. Compra fácil, rápido y seguro en Tienda S&K.",
  keywords: ["tienda online", "hogar", "cuidado personal", "juguetes", "Colombia", "Tienda S&K"],
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "Tienda S&K",
    title: "Tienda S&K — Hogar, Cuidado Personal y Juguetes",
    description:
      "Descubre productos de hogar, cuidado personal y juguetes con los mejores precios.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Tienda S&K" }],
    locale: "es_CO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda S&K",
    description: "Descubre productos de hogar, cuidado personal y juguetes con los mejores precios.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${roboto.variable} ${exo2.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tienda S&K" />
        {/* 180x180, el tamano que pide iOS. Antes apuntaba a header-logo.png:
            1774x887 y 749 KB para dibujarse como un icono de pantalla de
            inicio. */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); }); }`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
