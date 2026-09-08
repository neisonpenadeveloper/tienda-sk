/**
 * auditoria.mjs — Comprueba qué puede hacer un desconocido contra tu tienda.
 *
 * Usa la MISMA llave pública que viaja en el navegador de cualquier visitante,
 * así que mide exactamente lo que podría hacer alguien que abra la consola del
 * navegador estando en tiendasyk.store.
 *
 * Uso:   node seguridad/auditoria.mjs
 *
 * Es seguro: solo crea datos de prueba marcados como tal y los borra al final.
 * Pásalo después de cada cambio grande en la base de datos.
 *
 * OJO: en Postgres, una regla que bloquea una lectura o un borrado no devuelve
 * error, simplemente no devuelve (ni toca) ninguna fila. Por eso este script no
 * se conforma con mirar si hubo error: compara lo que ve un desconocido con lo
 * que hay de verdad, usando la llave secreta solo para saber la verdad.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Lee .env.local sin depender de ninguna librería. */
function variables() {
  const ruta = path.join(RAIZ, ".env.local");

  if (!fs.existsSync(ruta)) {
    console.error("No se encontró .env.local en la raíz del proyecto.");
    process.exit(1);
  }

  return Object.fromEntries(
    fs
      .readFileSync(ruta, "utf8")
      .split(/\r?\n/)
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
  );
}

const env = variables();
const visitante = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const verdad = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const hallazgos = [];
const aLimpiar = [];

const contar = async (cliente, tabla, filtro = (q) => q) => {
  const { count, error } = await filtro(
    cliente.from(tabla).select("*", { count: "exact", head: true })
  );
  return error ? null : count;
};

function anotar(problema, titulo, detalle) {
  hallazgos.push({ problema, titulo, detalle });
  console.log(`${problema ? " AVISO " : "  ok   "} ${titulo}`);
  console.log(`         ${detalle}`);
}

// ── Lectura ─────────────────────────────────────────────────────────────────
console.log("\n══ ¿Qué puede LEER un desconocido? ══\n");

const pedidosReales = await contar(verdad, "orders");
const pedidosVisibles = await contar(visitante, "orders");
anotar(
  pedidosVisibles > 0,
  "Pedidos de clientes",
  `hay ${pedidosReales} en la base; un desconocido ve ${pedidosVisibles}.`
);

const cuponesReales = await contar(verdad, "coupons");
const cuponesVisibles = await contar(visitante, "coupons");
anotar(
  cuponesVisibles > 0,
  "Cupones de descuento",
  `hay ${cuponesReales} en la base; un desconocido ve ${cuponesVisibles}.`
);

const ocultosReales = await contar(verdad, "products", (q) => q.eq("is_active", false));
const ocultosVisibles = await contar(visitante, "products", (q) => q.eq("is_active", false));
anotar(
  ocultosVisibles > 0,
  "Productos ocultos (borradores)",
  `hay ${ocultosReales} en la base; un desconocido ve ${ocultosVisibles}.`
);

const publicados = await contar(visitante, "products", (q) => q.eq("is_active", true));
anotar(
  !publicados,
  "Productos publicados (la tienda los necesita)",
  publicados ? `se ven ${publicados}, correcto.` : "NO se ven: la tienda saldría vacía."
);

// ── Escritura ───────────────────────────────────────────────────────────────
console.log("\n══ ¿Qué puede CAMBIAR un desconocido? ══\n");

const { data: usuarios } = await verdad.auth.admin.listUsers();
const { data: senuelo } = await verdad
  .from("products")
  .insert({
    name: `ZZ AUDITORIA ${Date.now()}`,
    price: 123456,
    stock: 7,
    category: "accesorios",
    is_active: false,
    user_id: usuarios?.users?.[0]?.id ?? null,
  })
  .select()
  .single();

if (senuelo) {
  aLimpiar.push(() => verdad.from("products").delete().eq("id", senuelo.id));

  await visitante.from("products").update({ price: 1, name: "HACKEADO" }).eq("id", senuelo.id);
  const { data: despues } = await verdad
    .from("products")
    .select("price")
    .eq("id", senuelo.id)
    .maybeSingle();

  anotar(
    !despues || despues.price !== 123456,
    "Cambiar el precio de un producto",
    !despues || despues.price !== 123456 ? `quedó en ${despues?.price}` : "rechazado."
  );

  await visitante.from("products").delete().eq("id", senuelo.id);
  const sigue = await contar(verdad, "products", (q) => q.eq("id", senuelo.id));
  anotar(sigue === 0, "Borrar un producto", sigue === 0 ? "el producto DESAPARECIÓ." : "rechazado.");
}

const referencia = `ZZ-AUDITORIA-${Date.now()}`;
const { data: pedidoFalso } = await visitante
  .from("orders")
  .insert({ reference: referencia, total_amount: 1, status: "paid", items: [] })
  .select();

if (pedidoFalso?.length) aLimpiar.push(() => verdad.from("orders").delete().eq("reference", referencia));
anotar(
  Boolean(pedidoFalso?.length),
  "Crear pedidos falsos marcados como pagados",
  pedidoFalso?.length ? `se insertó ${referencia}.` : "rechazado."
);

const { data: cuponFalso } = await visitante
  .from("coupons")
  .insert({ code: referencia, discount_pct: 99, is_active: true })
  .select();

if (cuponFalso?.length) aLimpiar.push(() => verdad.from("coupons").delete().eq("code", referencia));
anotar(Boolean(cuponFalso?.length), "Crear cupones de descuento", cuponFalso?.length ? "PERMITIDO." : "rechazado.");

// ── Imágenes ────────────────────────────────────────────────────────────────
console.log("\n══ Almacenamiento de imágenes ══\n");

const { data: listado } = await visitante.storage.from("product-images").list("", { limit: 100 });
anotar(
  Boolean(listado?.length),
  "Enumerar el contenido del bucket",
  listado?.length ? `se pueden listar ${listado.length} elemento(s).` : "no se puede enumerar."
);

const { error: errorSubida } = await visitante.storage
  .from("product-images")
  .upload(`auditoria-${Date.now()}.txt`, new Blob(["x"]), { contentType: "text/plain" });
anotar(!errorSubida, "Subir archivos al bucket", errorSubida ? "rechazado." : "PERMITIDO.");

// ── Limpieza ────────────────────────────────────────────────────────────────
for (const tarea of aLimpiar) await tarea();
await verdad.from("orders").delete().like("reference", "ZZ-AUDITORIA-%");
await verdad.from("products").delete().like("name", "ZZ AUDITORIA%");
await verdad.from("coupons").delete().like("code", "ZZ-AUDITORIA-%");

// ── Resumen ─────────────────────────────────────────────────────────────────
const problemas = hallazgos.filter((h) => h.problema);

console.log(`\n${"═".repeat(78)}`);
if (problemas.length) {
  console.log(`${problemas.length} problema(s) de ${hallazgos.length} comprobaciones:\n`);
  problemas.forEach((p) => console.log(`  · ${p.titulo}`));
  console.log("\nAplica seguridad/politicas.sql en Supabase → SQL Editor.");
} else {
  console.log("Todo correcto: la base de datos rechaza lo que debe rechazar.");
}
console.log("═".repeat(78));

process.exit(problemas.length ? 1 : 0);
