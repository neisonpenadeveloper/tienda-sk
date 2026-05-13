import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get("id");

  if (!transactionId) {
    return NextResponse.json({ error: "ID de transacción requerido" }, { status: 400 });
  }

  const isProduction = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.startsWith("pub_prod_");
  const wompiBase = isProduction
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";

  let transaction;
  try {
    const res = await fetch(`${wompiBase}/transactions/${transactionId}`, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 0 },
    });
    const json = await res.json();
    transaction = json?.data;
  } catch (err) {
    console.error("Error consultando Wompi:", err);
    return NextResponse.json({ error: "Error consultando pasarela" }, { status: 502 });
  }

  if (!transaction) {
    return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
  }

  // Actualizar estado en Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const newStatus =
    transaction.status === "APPROVED" ? "paid" :
    transaction.status === "DECLINED" ? "declined" :
    transaction.status === "VOIDED"   ? "voided" : "error";

  await supabase.from("orders")
    .update({
      status: newStatus,
      wompi_transaction_id: transactionId,
      updated_at: new Date().toISOString(),
    })
    .eq("reference", transaction.reference);

  return NextResponse.json({
    status: transaction.status,
    reference: transaction.reference,
    amountInCents: transaction.amount_in_cents,
    currency: transaction.currency,
  });
}
