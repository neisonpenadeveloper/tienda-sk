import type { NextConfig } from "next";

const securityHeaders = [
  // Fuerza HTTPS por 2 años, incluye subdominios
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Impide que la página se cargue dentro de un iframe (anti-clickjacking)
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Impide que el navegador adivine el tipo de archivo (anti-MIME sniffing)
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Controla qué información de referencia se envía al navegar
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Desactiva funciones del navegador que no se usan en la tienda
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), usb=(), payment=(self)",
  },
  // Content Security Policy — define exactamente qué recursos puede cargar la página
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requiere unsafe-inline/unsafe-eval para hidratación del servidor
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Estilos propios + estilos inline (fuentes auto-hosteadas via next/font)
      "style-src 'self' 'unsafe-inline'",
      // Fuentes auto-hosteadas por next/font en Vercel (sin Google Fonts externo)
      "font-src 'self'",
      // Imágenes: propias, data URIs, blob (previews), Supabase Storage específico, Google avatars
      "img-src 'self' data: blob: https://toidqirgvhnukbxubyou.supabase.co https://*.googleusercontent.com",
      // Conexiones permitidas: solo el proyecto Supabase específico + Wompi producción
      "connect-src 'self' https://toidqirgvhnukbxubyou.supabase.co wss://toidqirgvhnukbxubyou.supabase.co https://production.wompi.co https://sandbox.wompi.co",
      // Google OAuth y Wompi Checkout necesitan abrir frames
      "frame-src https://accounts.google.com https://checkout.wompi.co",
      // Nadie puede embeber esta página en un iframe
      "frame-ancestors 'none'",
      // La URL base solo puede ser el propio dominio
      "base-uri 'self'",
      // Los formularios solo pueden enviarse al propio dominio o Google OAuth
      "form-action 'self' https://accounts.google.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "toidqirgvhnukbxubyou.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
