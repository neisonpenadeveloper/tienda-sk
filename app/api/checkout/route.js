import { NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * Crea el pago de un carrito.
 *
 * Regla de oro de esta ruta: **nada de lo que manda el navegador se cree**.
 * Ni los precios, ni el descuento, ni quién dice ser el comprador. Todo se
 * vuelve a mirar contra la base de datos antes de firmar el cobro, porque el
 * cuerpo de esta petición lo puede escribir cualquiera a mano.
 */

/** Tope de líneas distintas en un carrito. Un pedido normal no llega ni cerca. */
const MAX_LINEAS = 50;

/** Unidades por línea. */
const MAX_UNIDADES = 100;

/** Formato de los identificadores de producto. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Descuento máximo que se acepta de un cupón, por si alguno se crea mal. */
const DESCUENTO_MAX_PCT = 70;

/**
 * Freno de peticiones por IP. Evita que alguien deje un script creando pedidos
 * toda la noche y te llene la tabla.
 *
 * Vive en memoria, así que en Vercel cuenta por instancia y no es una barrera
 * absoluta: es un freno, no una puerta blindada. La puerta blindada es que
 * ningún pedido se marca pagado sin que Wompi lo confirme.
 */
const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 10;
const visitas = new Map();

function demasiadasPeticiones(ip) {
  const ahora = Date.now();
  const previas = (visitas.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  previas.push(ahora);
  visitas.set(ip, previas);

  // Limpieza para que el mapa no crezca sin fin.
  if (visitas.size > 5000) {
    for (const [clave, marcas] of visitas) {
      if (!marcas.some((t) => ahora - t < VENTANA_MS)) visitas.delete(clave);
    }
  }

  return previas.length > MAX_POR_VENTANA;
}

/**
 * Averigua quién hace el pedido a partir del token de sesión, NO de lo que
 * diga el cuerpo de la petición. Antes el navegador mandaba `userId` y
 * `userEmail` y el servidor los guardaba tal cual: cualquiera podía crear
 * pedidos a nombre de otra persona.
 *
 * @param {Request} request
 * @returns {Promise<{id: string|null, email: string}>}
 */
async function identificar(request) {
  const cabecera = request.headers.get("authorization") ?? "";
  const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : null;

  if (!token) return { id: null, email: "" };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { id: null, email: "" };

  return { id: data.user.id, email: data.user.email ?? "" };
}

export async function POST(request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "desconocida";

  if (demasiadasPeticiones(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos seguidos. Espera un momento." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { cart, couponCode } = body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
  }

  if (cart.length > MAX_LINEAS) {
    return NextResponse.json({ error: "El carrito tiene demasiados productos" }, { status: 400 });
  }

  // ── Validar la forma de cada línea antes de tocar la base de datos ────────
  const lineas = [];

  for (const item of cart) {
    const id = String(item?.id ?? "");
    const cantidad = Number(item?.quantity);

    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_UNIDADES) {
      return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
    }
    if (lineas.some((l) => l.id === id)) {
      return NextResponse.json({ error: "Producto repetido en el carrito" }, { status: 400 });
    }

    lineas.push({ id, cantidad });
  }

  // ── Quién compra: se toma del token, no del cuerpo ────────────────────────
  const comprador = await identificar(request);

  // ── Precios y existencias reales ──────────────────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { data: productos, error: errorProductos } = await supabase
    .from("products")
    .select("id, name, price, stock, is_active")
    .in("id", lineas.map((l) => l.id));

  if (errorProductos || !productos) {
    console.error("Error validando productos:", errorProductos);
    return NextResponse.json({ error: "Error validando productos" }, { status: 500 });
  }

  const detalle = [];

  for (const linea of lineas) {
    const producto = productos.find((p) => p.id === linea.id);

    if (!producto || !producto.is_active) {
      return NextResponse.json({ error: "Producto no disponible" }, { status: 400 });
    }
    if (producto.stock !== null && producto.stock < linea.cantidad) {
      return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 });
    }
    if (!Number.isFinite(producto.price) || producto.price <= 0) {
      return NextResponse.json({ error: "Producto sin precio válido" }, { status: 400 });
    }

    detalle.push({
      id: producto.id,
      name: producto.name,
      price: producto.price,
      quantity: linea.cantidad,
    });
  }

  const subtotal = detalle.reduce((suma, l) => suma + l.price * l.quantity, 0);

  // ── Cupón: se comprueba aquí, contra la base de datos ─────────────────────
  //
  // Antes el descuento solo existía en el navegador: el cliente veía el total
  // rebajado y la pasarela le cobraba el precio completo. Ahora el código llega
  // hasta aquí, se busca, y si es válido se descuenta del cobro de verdad.
  let cupon = null;

  if (couponCode) {
    const codigo = String(couponCode).trim().toUpperCase().slice(0, 40);
    let valido = false;

    if (/^[A-Z0-9_-]{2,40}$/.test(codigo)) {
      const { data: encontrado } = await supabase
        .from("coupons")
        .select("code, discount_pct")
        .eq("code", codigo)
        .eq("is_active", true)
        .maybeSingle();

      const pct = Number(encontrado?.discount_pct);

      if (encontrado && Number.isFinite(pct) && pct > 0 && pct <= DESCUENTO_MAX_PCT) {
        cupon = { codigo: encontrado.code, pct };
        valido = true;
      }
    }

    if (!valido) {
      return NextResponse.json({ error: "Cupón inválido o expirado" }, { status: 400 });
    }
  }

  const descuento = cupon ? Math.round((subtotal * cupon.pct) / 100) : 0;
  const total = subtotal - descuento;
  const amountInCents = Math.round(total * 100);

  if (!Number.isSafeInteger(amountInCents) || amountInCents < 100) {
    return NextResponse.json({ error: "Monto demasiado bajo" }, { status: 400 });
  }

  // ── Referencia y firma de integridad ──────────────────────────────────────
  //
  // La referencia se genera con `randomUUID`, no con `Math.random`: un número
  // de pedido adivinable deja enumerar los pedidos de los demás.
  const reference = `SK-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!integritySecret || !publicKey || !appUrl) {
    console.error("Faltan variables de la pasarela de pago.");
    return NextResponse.json({ error: "Pasarela no configurada" }, { status: 503 });
  }

  const signature = createHash("sha256")
    .update(`${reference}${amountInCents}COP${integritySecret}`)
    .digest("hex");

  // ── Guardar el pedido pendiente ───────────────────────────────────────────
  //
  // Se guarda `detalle`, armado con los datos de la base, y no el carrito que
  // mandó el navegador: así el pedido no puede contener nombres ni precios
  // inventados.
  const pedido = {
    reference,
    user_id: comprador.id,
    user_email: comprador.email,
    items: detalle,
    total_amount: amountInCents,
    status: "pending",
  };

  const extras = {
    coupon_code: cupon?.codigo ?? null,
    discount_amount: Math.round(descuento * 100),
  };

  let { error: errorGuardar } = await supabase.from("orders").insert({ ...pedido, ...extras });

  // Si todavía no se han añadido las columnas del cupón (ver
  // seguridad/politicas.sql), se guarda sin ellas antes que dejar a un cliente
  // sin poder pagar.
  if (errorGuardar && /column|columna/i.test(errorGuardar.message ?? "")) {
    console.warn("orders no tiene las columnas de cupón; se guarda sin ellas.");
    ({ error: errorGuardar } = await supabase.from("orders").insert(pedido));
  }

  if (errorGuardar) {
    console.error("Error guardando orden:", errorGuardar);
    return NextResponse.json({ error: "Error creando la orden" }, { status: 500 });
  }

  const params = new URLSearchParams({
    "public-key": publicKey,
    currency: "COP",
    "amount-in-cents": amountInCents.toString(),
    reference,
    "signature:integrity": signature,
    "redirect-url": `${appUrl}/checkout/result`,
  });

  if (comprador.email) params.set("customer-email", comprador.email);

  return NextResponse.json({
    checkoutUrl: `https://checkout.wompi.co/p/?${params.toString()}`,
    reference,
    // El carrito los usa para avisar si el total mostrado no era el real.
    subtotal,
    discount: descuento,
    total,
  });
}
