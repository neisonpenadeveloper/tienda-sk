import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Comprueba en Wompi cómo quedó una transacción y actualiza el pedido.
 *
 * Lo importante aquí: un pedido solo pasa a "pagado" si Wompi dice que se
 * aprobó **y** el dinero que se movió coincide con lo que costaba el pedido.
 * Antes bastaba con que la referencia existiera, así que una transacción
 * aprobada por un importe distinto —o en otra moneda— habría marcado el pedido
 * como pagado igual.
 */

/** Formato de los identificadores de transacción de Wompi. */
const ID_TRANSACCION_RE = /^[a-zA-Z0-9_-]{1,64}$/;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get("id");

  if (!transactionId || !ID_TRANSACCION_RE.test(transactionId)) {
    return NextResponse.json({ error: "ID de transacción inválido" }, { status: 400 });
  }

  const isProduction = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.startsWith("pub_prod_");
  const wompiBase = isProduction
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";

  let transaction;
  try {
    const res = await fetch(`${wompiBase}/transactions/${transactionId}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });
    const json = await res.json();
    transaction = json?.data;
  } catch (err) {
    console.error("Error consultando Wompi:", err);
    return NextResponse.json({ error: "Error consultando pasarela" }, { status: 502 });
  }

  if (!transaction?.reference) {
    return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    // En Vercel la variable se llama SUPABASE_SERVICE_KEY; en local, _ROLE_KEY.
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const { data: pedido } = await supabase
    .from("orders")
    .select("reference, total_amount, status")
    .eq("reference", transaction.reference)
    .maybeSingle();

  if (!pedido) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  // ── El dinero tiene que cuadrar ───────────────────────────────────────────
  //
  // `amount_in_cents` y `currency` los reporta Wompi para esa transacción;
  // `total_amount` es lo que este servidor calculó y firmó al crear el pedido.
  // Si no coinciden, algo no encaja y el pedido NO se da por pagado.
  const montoCoincide = Number(transaction.amount_in_cents) === Number(pedido.total_amount);
  const monedaCoincide = transaction.currency === "COP";

  if (transaction.status === "APPROVED" && !(montoCoincide && monedaCoincide)) {
    console.error(
      `Transacción ${transactionId} aprobada pero no cuadra con el pedido ${pedido.reference}: ` +
        `pagado ${transaction.amount_in_cents} ${transaction.currency}, esperado ${pedido.total_amount} COP.`
    );

    await supabase
      .from("orders")
      .update({
        status: "revisar",
        wompi_transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq("reference", pedido.reference);

    return NextResponse.json(
      { error: "El pago no coincide con el pedido. Revisaremos el caso antes de despacharlo." },
      { status: 409 }
    );
  }

  const nuevoEstado =
    transaction.status === "APPROVED" ? "paid" :
    transaction.status === "DECLINED" ? "declined" :
    transaction.status === "VOIDED"   ? "voided" :
    transaction.status === "PENDING"  ? "pending" : "error";

  // Un pedido ya pagado no se degrada por una consulta posterior.
  if (pedido.status === "paid" && nuevoEstado !== "paid") {
    return NextResponse.json({
      status: "APPROVED",
      reference: pedido.reference,
      amountInCents: pedido.total_amount,
      currency: "COP",
    });
  }

  await supabase
    .from("orders")
    .update({
      status: nuevoEstado,
      wompi_transaction_id: transactionId,
      updated_at: new Date().toISOString(),
    })
    .eq("reference", pedido.reference);

  return NextResponse.json({
    status: transaction.status,
    reference: transaction.reference,
    amountInCents: transaction.amount_in_cents,
    currency: transaction.currency,
  });
}
