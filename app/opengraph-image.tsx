import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tienda S&K";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAF7F4",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Blob coral */}
        <div style={{ position: "absolute", top: -150, right: -150, width: 520, height: 520, borderRadius: "50%", background: "rgba(232,64,42,0.13)", display: "flex" }} />
        {/* Blob azul */}
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 420, height: 420, borderRadius: "50%", background: "rgba(13,61,181,0.10)", display: "flex" }} />

        {/* Logo circular */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "#0D3DB5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
            boxShadow: "0 16px 48px rgba(13,61,181,0.35)",
          }}
        >
          <span style={{ fontSize: 58, fontWeight: 800, color: "#fff", letterSpacing: -2, display: "flex" }}>
            SK
          </span>
        </div>

        {/* Titulo */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 88, fontWeight: 800, color: "#1A1A1A", letterSpacing: -3, lineHeight: 1, display: "flex" }}>
            Tienda
          </span>
          <span style={{ fontSize: 88, fontWeight: 800, color: "#E8402A", letterSpacing: -3, lineHeight: 1, marginLeft: 20, display: "flex" }}>
            S
          </span>
          <span style={{ fontSize: 68, fontWeight: 800, color: "#0D3DB5", lineHeight: 1, marginTop: 12, marginLeft: 4, display: "flex" }}>
            y
          </span>
          <span style={{ fontSize: 88, fontWeight: 800, color: "#E8402A", letterSpacing: -3, lineHeight: 1, marginLeft: 4, display: "flex" }}>
            K
          </span>
        </div>

        {/* Subtitulo */}
        <div style={{ fontSize: 30, color: "#9B948E", fontWeight: 400, marginBottom: 44, display: "flex" }}>
          Hogar - Cuidado Personal - Juguetes
        </div>

        {/* Pill */}
        <div
          style={{
            background: "rgba(232,64,42,0.10)",
            border: "2px solid rgba(232,64,42,0.28)",
            borderRadius: 999,
            padding: "12px 36px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#E8402A", display: "flex" }} />
          <span style={{ color: "#E8402A", fontSize: 22, fontWeight: 700, display: "flex" }}>
            Compra facil, rapido y seguro en Colombia
          </span>
        </div>

        {/* Barra inferior */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 12, background: "#E8402A", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
