import { NextResponse } from "next/server";

/**
 * Vuelta del inicio de sesión con Google.
 *
 * El parámetro `next` dice a dónde llevar al usuario después de entrar, y lo
 * elige quien arma el enlace. Por eso solo se aceptan rutas internas: sin él,
 * un enlace preparado podría sacar al usuario a otro sitio justo después de
 * iniciar sesión en tu tienda, que es la trampa clásica para robar cuentas.
 *
 * @param {string|null} destino
 * @returns {string} Una ruta interna segura.
 */
function rutaInterna(destino) {
  if (typeof destino !== "string" || !destino.startsWith("/")) return "/";
  // "//otro-sitio.com" y "/\\otro-sitio.com" son direcciones externas
  // disfrazadas de ruta.
  if (/^\/[/\\]/.test(destino)) return "/";
  return destino;
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = rutaInterna(searchParams.get("next"));

  if (code) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          flowType: "pkce",
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
