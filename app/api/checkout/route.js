import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { cart, userId, userEmail } = body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
  }

  // Validar cantidades básicas antes de ir a la BD
  for (const item of cart) {
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
    }
  }

  // Verificar precios y stock reales contra la base de datos
  const supabaseVerify = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const ids = cart.map(i => i.id);
  const { data: dbProducts, error: fetchError } = await supabaseVerify
    .from("products")
    .select("id, price, stock, is_active")
    .in("id", ids);

  if (fetchError || !dbProducts) {
    return NextResponse.json({ error: "Error validando productos" }, { status: 500 });
  }

  // Rechazar si algún producto no existe, está inactivo o sin stock
  for (const item of cart) {
    const dbProduct = dbProducts.find(p => p.id === item.id);
    if (!dbProduct || !dbProduct.is_active) {
      return NextResponse.json({ error: `Producto no disponible` }, { status: 400 });
    }
    if (dbProduct.stock !== null && dbProduct.stock < Number(item.quantity)) {
      return NextResponse.json({ error: `Stock insuficiente` }, { status: 400 });
    }
  }

  // Calcular total con precios reales de la BD (ignorar precio del cliente)
  const total = cart.reduce((sum, item) => {
    const dbProduct = dbProducts.find(p => p.id === item.id);
    return sum + dbProduct.price * Number(item.quantity);
  }, 0);

  const amountInCents = Math.round(total * 100);

  if (amountInCents < 100) {
    return NextResponse.json({ error: "Monto demasiado bajo" }, { status: 400 });
  }

  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  const reference = `SK-${Date.now()}-${suffix}`;

  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!integritySecret) {
    return NextResponse.json({ error: "Pasarela no configurada" }, { status: 503 });
  }

  const signature = createHash("sha256")
    .update(`${reference}${amountInCents}COP${integritySecret}`)
    .digest("hex");

  // Guardar orden pendiente
  const { error: dbError } = await supabaseVerify.from("orders").insert({
    reference,
    user_id: userId ?? null,
    user_email: userEmail ?? "",
    items: cart,
    total_amount: amountInCents,
    status: "pending",
  });

  if (dbError) {
    console.error("Error guardando orden:", dbError);
    return NextResponse.json({ error: "Error creando la orden" }, { status: 500 });
  }

  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const params = new URLSearchParams({
    "public-key": publicKey,
    "currency": "COP",
    "amount-in-cents": amountInCents.toString(),
    "reference": reference,
    "signature:integrity": signature,
    "redirect-url": `${appUrl}/checkout/result`,
  });

  if (userEmail) params.set("customer-email", userEmail);

  return NextResponse.json({
    checkoutUrl: `https://checkout.wompi.co/p/?${params.toString()}`,
    reference,
  });
}
