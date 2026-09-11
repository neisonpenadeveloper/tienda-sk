import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Comprueba un código de cupón.
 *
 * Existe porque los cupones dejaron de ser públicos. Antes el navegador se
 * descargaba la tabla entera para validarlos: cualquiera podía leer todos tus
 * códigos, incluidos los desactivados y los que aún no habías lanzado.
 *
 * Aquí solo se responde por el código exacto que pregunten, y con un freno para
 * que nadie los descubra probando a lo bruto. El descuento de verdad no se
 * aplica aquí: lo vuelve a calcular `/api/checkout` al firmar el cobro.
 */

/** Freno por IP: probar códigos al azar tiene que salir caro. */
const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 12;
const intentos = new Map();

function demasiadosIntentos(ip) {
  const ahora = Date.now();
  const previos = (intentos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  previos.push(ahora);
  intentos.set(ip, previos);

  if (intentos.size > 5000) {
    for (const [clave, marcas] of intentos) {
      if (!marcas.some((t) => ahora - t < VENTANA_MS)) intentos.delete(clave);
    }
  }

  return previos.length > MAX_POR_VENTANA;
}

export async function POST(request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "desconocida";

  if (demasiadosIntentos(ip)) {
    return NextResponse.json(
      { valid: false, error: "Demasiados intentos. Espera un momento." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, error: "Petición inválida" }, { status: 400 });
  }

  const codigo = String(body?.code ?? "").trim().toUpperCase().slice(0, 40);

  if (!/^[A-Z0-9_-]{2,40}$/.test(codigo)) {
    return NextResponse.json({ valid: false, error: "Cupón inválido o expirado" });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    // En Vercel la variable se llama SUPABASE_SERVICE_KEY; en local, _ROLE_KEY.
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const { data: cupon, error } = await supabase
    .from("coupons")
    .select("code, discount_pct")
    .eq("code", codigo)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Error validando cupón:", error);
    return NextResponse.json({ valid: false, error: "No se pudo validar el cupón" }, { status: 500 });
  }

  const pct = Number(cupon?.discount_pct);

  if (!cupon || !Number.isFinite(pct) || pct <= 0) {
    // La misma respuesta para "no existe" y para "está desactivado": así no se
    // puede averiguar qué códigos existen.
    return NextResponse.json({ valid: false, error: "Cupón inválido o expirado" });
  }

  return NextResponse.json({ valid: true, code: cupon.code, pct });
}
