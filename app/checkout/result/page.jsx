"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const CORAL = "#E8402A";

const fmtCOP = n =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n / 100);

function LoadingView() {
  return (
    <div style={pageWrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div
        style={{
          width: 52, height: 52,
          border: "4px solid #EDE8E2",
          borderTopColor: CORAL,
          borderRadius: "50%",
          animation: "spin 0.75s linear infinite",
          marginBottom: 20,
        }}
      />
      <p style={{ color: "#6B6560", fontSize: 16, fontFamily: "var(--font-dm-sans), sans-serif" }}>
        Verificando tu pago…
      </p>
    </div>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [status, setStatus] = useState("loading");
  const [info, setInfo] = useState({ reference: "", amount: 0 });

  useEffect(() => {
    if (!id) { setStatus("error"); return; }

    fetch(`/api/checkout/verify?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(data => {
        setInfo({ reference: data.reference ?? "", amount: data.amountInCents ?? 0 });
        if (data.status === "APPROVED")      setStatus("approved");
        else if (data.status === "DECLINED") setStatus("declined");
        else                                 setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") return <LoadingView />;

  if (status === "approved") {
    return (
      <div style={pageWrap}>
        <div style={{ ...circle, background: "#E8F5EE" }}>
          <span style={{ fontSize: 40, lineHeight: 1 }}>✓</span>
        </div>
        <h1 style={title}>¡Pago exitoso!</h1>
        <p style={subtitle}>
          Tu pedido ha sido confirmado. Recibirás un correo con todos los detalles de tu compra.
        </p>
        <div style={infoBox}>
          <Row label="Referencia" value={info.reference} />
          <Row label="Total pagado" value={fmtCOP(info.amount)} />
        </div>
        <HomeButton label="Seguir comprando" />
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div style={pageWrap}>
        <div style={{ ...circle, background: "#FFF0EE" }}>
          <span style={{ fontSize: 40, lineHeight: 1 }}>✗</span>
        </div>
        <h1 style={title}>Pago rechazado</h1>
        <p style={subtitle}>
          Tu pago no pudo procesarse. Verifica los datos de tu tarjeta e intenta de nuevo.
        </p>
        <HomeButton label="Intentar de nuevo" />
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>⚠️</div>
      <h1 style={title}>Algo salió mal</h1>
      <p style={subtitle}>
        No pudimos verificar tu pago. Si se realizó el cobro, contáctanos y lo resolvemos.
      </p>
      <HomeButton label="Volver a la tienda" />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #EDE8E2" }}>
      <span style={{ color: "#6B6560", fontSize: 14, fontFamily: "var(--font-dm-sans), sans-serif" }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: 14, color: "#1A1A1A", fontFamily: "var(--font-dm-sans), sans-serif" }}>{value}</span>
    </div>
  );
}

function HomeButton({ label }) {
  return (
    <a
      href="/"
      style={{
        display: "inline-block",
        background: CORAL, color: "#fff",
        padding: "14px 36px", borderRadius: 28,
        fontWeight: 700, fontSize: 15,
        fontFamily: "var(--font-dm-sans), sans-serif",
        textDecoration: "none",
        boxShadow: "0 8px 24px rgba(232,64,42,0.30)",
      }}
    >
      {label}
    </a>
  );
}

const pageWrap = {
  minHeight: "100vh",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  padding: "24px", textAlign: "center",
  background: "#FDFAF7",
};

const circle = {
  width: 88, height: 88, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  marginBottom: 24,
};

const title = {
  fontSize: 28, fontWeight: 800, color: "#1A1A1A",
  marginBottom: 12, fontFamily: "var(--font-dm-sans), sans-serif",
};

const subtitle = {
  color: "#6B6560", fontSize: 16, lineHeight: 1.65,
  marginBottom: 28, maxWidth: 420,
  fontFamily: "var(--font-dm-sans), sans-serif",
};

const infoBox = {
  background: "#F5F0EA", borderRadius: 16,
  padding: "4px 20px", marginBottom: 28,
  width: "100%", maxWidth: 400,
};

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <ResultContent />
    </Suspense>
  );
}
